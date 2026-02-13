
-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');

-- Create subscription tier enum
CREATE TYPE public.subscription_tier AS ENUM ('free', 'starter', 'pro', 'enterprise');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Subscription plans table (public, read-only for users)
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier subscription_tier NOT NULL UNIQUE,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  chat_limit INTEGER NOT NULL DEFAULT 5,
  brand_limit INTEGER NOT NULL DEFAULT 1,
  business_plan_limit INTEGER NOT NULL DEFAULT 1,
  pitch_deck_limit INTEGER NOT NULL DEFAULT 1,
  llc_limit INTEGER NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view plans" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Admins can manage plans" ON public.subscription_plans FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- User subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage subscriptions" ON public.user_subscriptions FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Usage tracking (monthly reset)
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()),
  UNIQUE (user_id, feature, period_start)
);

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON public.usage_tracking FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default plans
INSERT INTO public.subscription_plans (name, tier, price_monthly, chat_limit, brand_limit, business_plan_limit, pitch_deck_limit, llc_limit, features) VALUES
  ('Free', 'free', 0, 5, 1, 1, 1, 0, '["AI Chat (5/mo)", "1 Brand Generation", "1 Business Plan", "1 Pitch Deck"]'::jsonb),
  ('Starter', 'starter', 2900, 50, 5, 5, 5, 2, '["AI Chat (50/mo)", "5 Brand Generations", "5 Business Plans", "5 Pitch Decks", "2 LLC Formations", "Email Support"]'::jsonb),
  ('Pro', 'pro', 9900, 500, 50, 25, 25, 10, '["AI Chat (500/mo)", "50 Brand Generations", "25 Business Plans", "25 Pitch Decks", "10 LLC Formations", "Priority Support", "Export to PDF"]'::jsonb),
  ('Enterprise', 'enterprise', 29900, -1, -1, -1, -1, -1, '["Unlimited Everything", "Dedicated Account Manager", "Custom Integrations", "API Access", "White-label Options"]'::jsonb);

-- Helper function to check usage limits
CREATE OR REPLACE FUNCTION public.get_user_tier(_user_id UUID)
RETURNS subscription_tier
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT sp.tier FROM public.user_subscriptions us 
     JOIN public.subscription_plans sp ON us.plan_id = sp.id 
     WHERE us.user_id = _user_id AND us.status = 'active'),
    'free'::subscription_tier
  )
$$;
