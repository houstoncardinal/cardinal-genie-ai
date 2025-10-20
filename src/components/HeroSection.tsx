import { Button } from "@/components/ui/button";
import { cardinalButtonVariants } from "@/components/ui/button-variants";
import { CardinalLogo } from "@/components/CardinalLogo";
import { Scene3D } from "@/components/Scene3D";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-background.png";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-glow" />
      
      {/* 3D Scene */}
      <Scene3D />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-slide-up">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <CardinalLogo size="lg" className="animate-float" />
          </div>
          
          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="glow-text">Cardinal Business</span>
            <br />
            <span className="bg-gradient-cardinal bg-clip-text text-transparent">
              Genie
            </span>
          </h1>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light">
            Your AI Partner in Building Empires
          </p>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Experience the future of business consulting with our 3D AI-powered platform. 
            Get expert guidance on LLC formation, branding, strategy, and more — instantly.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link to="/chat">
              <Button 
                className={cardinalButtonVariants({ variant: "hero", size: "lg" })}
              >
                <Sparkles className="w-5 h-5" />
                Launch Genie
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button 
              className={cardinalButtonVariants({ variant: "glass", size: "lg" })}
            >
              <Zap className="w-5 h-5" />
              Explore Features
            </Button>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-4xl mx-auto">
            <div className="glass p-6 rounded-xl hover:glow-border transition-all">
              <h3 className="font-display text-lg font-semibold mb-2 text-cardinal-red">
                Expert Business Advice
              </h3>
              <p className="text-sm text-muted-foreground">
                LLC formation, tax structures, and strategic planning powered by advanced AI
              </p>
            </div>
            <div className="glass p-6 rounded-xl hover:glow-border transition-all">
              <h3 className="font-display text-lg font-semibold mb-2 text-cardinal-red">
                3D Voice Interface
              </h3>
              <p className="text-sm text-muted-foreground">
                Interact with a hyper-realistic AI avatar that speaks and responds naturally
              </p>
            </div>
            <div className="glass p-6 rounded-xl hover:glow-border transition-all">
              <h3 className="font-display text-lg font-semibold mb-2 text-cardinal-red">
                Brand Generation
              </h3>
              <p className="text-sm text-muted-foreground">
                Create complete brand identities, logos, and marketing materials instantly
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
