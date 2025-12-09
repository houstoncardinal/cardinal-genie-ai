import { Navigation } from "@/components/Navigation";
import { FeatureCard } from "@/components/FeatureCard";
import { 
  MessageSquare, 
  Palette, 
  FileText, 
  Building, 
  Calculator, 
  Scale,
  Target,
  Users,
  TrendingUp
} from "lucide-react";

const services = [
  {
    icon: MessageSquare,
    title: "AI Business Consultant",
    description: "Get instant expert advice on any business topic. From LLC formation to marketing strategy, our AI consultant provides world-class guidance 24/7.",
    link: "/chat",
    linkText: "Start Consulting"
  },
  {
    icon: Palette,
    title: "Brand & Logo Generator",
    description: "Create stunning, professional logos and brand identities in seconds. AI-powered design that captures your business essence perfectly.",
    link: "/brand-generator",
    linkText: "Create Brand"
  },
  {
    icon: FileText,
    title: "Business Plan Generator",
    description: "Generate comprehensive, investor-ready business plans with financial projections, market analysis, and strategic roadmaps.",
    link: "/business-plan",
    linkText: "Generate Plan"
  },
  {
    icon: Building,
    title: "LLC Formation Wizard",
    description: "Form your LLC in any state with step-by-step guidance. Get all necessary documents, operating agreements, and compliance checklists.",
    link: "/llc-formation",
    linkText: "Start Formation"
  },
  {
    icon: Calculator,
    title: "Financial Calculator",
    description: "Calculate startup costs, revenue projections, break-even analysis, and funding requirements with our intelligent financial tools.",
    link: "/chat",
    linkText: "Calculate Now"
  },
  {
    icon: Scale,
    title: "Tax Structure Advisor",
    description: "Compare LLC, S-Corp, and C-Corp structures. Understand tax implications and choose the optimal structure for your situation.",
    link: "/chat",
    linkText: "Get Advice"
  },
  {
    icon: Target,
    title: "Marketing Strategy",
    description: "Develop winning marketing strategies tailored to your industry. Get actionable campaigns, channel recommendations, and growth tactics.",
    link: "/chat",
    linkText: "Build Strategy"
  },
  {
    icon: Users,
    title: "Investor Pitch Prep",
    description: "Prepare for investor meetings with pitch deck templates, valuation guidance, and practice Q&A sessions with our AI consultant.",
    link: "/chat",
    linkText: "Prepare Pitch"
  },
  {
    icon: TrendingUp,
    title: "Growth Analytics",
    description: "Get insights on scaling your business with data-driven recommendations for operations, hiring, and market expansion.",
    link: "/chat",
    linkText: "Analyze Growth"
  }
];

export default function Services() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-slide-up">
            <h1 className="font-display text-5xl font-bold mb-4 glow-text">
              Our Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to launch, grow, and scale your business. 
              Powered by AI, designed for entrepreneurs who dream big.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <FeatureCard
                key={service.title}
                icon={service.icon}
                title={service.title}
                description={service.description}
                link={service.link}
                linkText={service.linkText}
              />
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 glass-strong p-8 rounded-2xl text-center">
            <h2 className="font-display text-3xl font-bold mb-4">
              Ready to Build Your Empire?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of entrepreneurs who are using Cardinal Business Genie 
              to transform their ideas into thriving businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/chat" className="inline-flex items-center justify-center gap-2 bg-gradient-cardinal text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Start Free Consultation
              </a>
              <a href="/llc-formation" className="inline-flex items-center justify-center gap-2 glass border border-border/50 px-8 py-3 rounded-lg font-semibold hover:glow-border transition-all">
                Form Your LLC
              </a>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "10K+", label: "Businesses Launched" },
              { value: "50K+", label: "Plans Generated" },
              { value: "100K+", label: "Logos Created" },
              { value: "98%", label: "Satisfaction Rate" },
            ].map((stat) => (
              <div key={stat.label} className="glass p-6 rounded-xl text-center">
                <p className="font-display text-3xl font-bold text-cardinal-red mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
