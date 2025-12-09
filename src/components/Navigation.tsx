import { CardinalLogo } from "@/components/CardinalLogo";
import { Button } from "@/components/ui/button";
import { cardinalButtonVariants } from "@/components/ui/button-variants";
import { Link } from "react-router-dom";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <CardinalLogo size="sm" />
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight group-hover:text-cardinal-red transition-colors">
                Cardinal Genie
              </span>
              <span className="text-xs text-muted-foreground">
                by Cardinal Consulting
              </span>
            </div>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/chat" className="text-sm font-medium hover:text-cardinal-red transition-colors">
              AI Assistant
            </Link>
            <Link to="/brand-generator" className="text-sm font-medium hover:text-cardinal-red transition-colors">
              Brand Generator
            </Link>
            <Link to="/business-plan" className="text-sm font-medium hover:text-cardinal-red transition-colors">
              Business Plan
            </Link>
            <Link to="/llc-formation" className="text-sm font-medium hover:text-cardinal-red transition-colors">
              LLC Formation
            </Link>
            <Link to="/services" className="text-sm font-medium hover:text-cardinal-red transition-colors">
              All Services
            </Link>
          </div>
          
          {/* CTA */}
          <Link to="/chat">
            <Button className={cardinalButtonVariants({ variant: "hero" })}>
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
