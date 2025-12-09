import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
  linkText?: string;
}

export const FeatureCard = ({ icon: Icon, title, description, link, linkText = "Get Started" }: FeatureCardProps) => {
  return (
    <Link 
      to={link}
      className="glass p-6 rounded-xl hover:glow-border transition-all group cursor-pointer block"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-gradient-cardinal shrink-0">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-cardinal-red transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          <span className="text-sm text-cardinal-red font-medium inline-flex items-center gap-1">
            {linkText}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
};
