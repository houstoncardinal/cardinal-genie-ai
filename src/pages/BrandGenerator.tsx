import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cardinalButtonVariants } from "@/components/ui/button-variants";
import { Sparkles, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function BrandGenerator() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [style, setStyle] = useState("modern");
  const [colors, setColors] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!businessName || !industry) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a business name and industry.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedLogo(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-logo", {
        body: {
          businessName,
          industry,
          style,
          colors: colors || "professional color palette",
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedLogo(data.imageUrl);
        toast({
          title: "Logo Generated!",
          description: "Your business logo has been created successfully.",
        });
      }
    } catch (error) {
      console.error("Logo generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedLogo) return;
    
    const link = document.createElement('a');
    link.href = generatedLogo;
    link.download = `${businessName.replace(/\s+/g, '-').toLowerCase()}-logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slideUp">
            <h1 className="font-display text-5xl font-bold mb-4 glow-text">
              Brand Generator
            </h1>
            <p className="text-xl text-muted-foreground">
              AI-powered branding and logo creation in seconds
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="glass-strong p-8 rounded-2xl space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-base">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                  className="bg-background/50 border-border/50 focus:border-cardinal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-base">Industry *</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., Technology, Healthcare, Finance"
                  className="bg-background/50 border-border/50 focus:border-cardinal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style" className="text-base">Logo Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern & Minimalist</SelectItem>
                    <SelectItem value="professional">Professional & Corporate</SelectItem>
                    <SelectItem value="creative">Creative & Artistic</SelectItem>
                    <SelectItem value="tech">Tech & Futuristic</SelectItem>
                    <SelectItem value="elegant">Elegant & Luxury</SelectItem>
                    <SelectItem value="playful">Playful & Fun</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colors" className="text-base">Preferred Colors</Label>
                <Input
                  id="colors"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  placeholder="e.g., Blue and Gold, Red and Black"
                  className="bg-background/50 border-border/50 focus:border-cardinal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">Additional Details</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any specific elements or ideas you want in the logo?"
                  className="bg-background/50 border-border/50 focus:border-cardinal-red min-h-24"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={cardinalButtonVariants({ variant: "hero", size: "lg" }) + " w-full"}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Brand & Logo
                  </>
                )}
              </Button>
            </div>

            {/* Preview Area */}
            <div className="glass-strong p-8 rounded-2xl flex flex-col items-center justify-center min-h-[600px]">
              {!generatedLogo && !isGenerating && (
                <div className="text-center text-muted-foreground">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Your generated logo will appear here</p>
                  <p className="text-sm mt-2">Fill in the details and click generate</p>
                </div>
              )}

              {isGenerating && (
                <div className="text-center">
                  <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-cardinal-red" />
                  <p className="text-lg font-medium">Creating your brand identity...</p>
                  <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
                </div>
              )}

              {generatedLogo && (
                <div className="space-y-6 w-full">
                  <div className="relative bg-gradient-to-br from-background to-background/50 rounded-xl p-8 border border-border/50">
                    <img 
                      src={generatedLogo} 
                      alt={`${businessName} logo`}
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleDownload}
                      className={cardinalButtonVariants({ variant: "hero" }) + " w-full"}
                    >
                      <Download className="w-5 h-5" />
                      Download Logo
                    </Button>
                    
                    <Button
                      onClick={handleGenerate}
                      variant="outline"
                      className="w-full glass hover:glass-strong"
                      disabled={isGenerating}
                    >
                      <Sparkles className="w-5 h-5" />
                      Generate Another
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
