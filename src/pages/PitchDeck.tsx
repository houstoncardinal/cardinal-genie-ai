import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cardinalButtonVariants } from "@/components/ui/button-variants";
import { MessageRenderer } from "@/components/MessageRenderer";
import { 
  Presentation, 
  Download, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Target,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Rocket,
  HandshakeIcon
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Slide {
  title: string;
  content: string;
  icon: React.ElementType;
}

const slideIcons: Record<string, React.ElementType> = {
  "Problem": Target,
  "Solution": Lightbulb,
  "Market Opportunity": TrendingUp,
  "Business Model": DollarSign,
  "Traction": BarChart3,
  "Team": Users,
  "Financials": BarChart3,
  "The Ask": HandshakeIcon,
  "Vision": Rocket
};

export default function PitchDeck() {
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [solution, setSolution] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [stage, setStage] = useState("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleGenerate = async () => {
    if (!companyName || !problemStatement || !solution) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setSlides([]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [{
              role: "user",
              content: `Generate a professional investor pitch deck for:
              Company: ${companyName}
              Industry: ${industry}
              Problem: ${problemStatement}
              Solution: ${solution}
              Funding Goal: ${fundingGoal}
              Stage: ${stage}
              
              Return a JSON array with exactly 8 slides:
              [
                {"title": "Problem", "content": "Rich markdown content with data, stats, bullet points..."},
                {"title": "Solution", "content": "Rich markdown with features, benefits..."},
                {"title": "Market Opportunity", "content": "Market size, TAM/SAM/SOM with actual numbers..."},
                {"title": "Business Model", "content": "Revenue streams, pricing, unit economics..."},
                {"title": "Traction", "content": "Metrics, growth, milestones with charts..."},
                {"title": "Team", "content": "Team strengths, experience..."},
                {"title": "Financials", "content": "Projections with chart data..."},
                {"title": "The Ask", "content": "Funding amount, use of funds, timeline..."}
              ]
              
              Make each slide content RICH with:
              - Use \`\`\`chart:bar or \`\`\`chart:line for data visualization
              - Use \`\`\`metrics for key stats
              - Use markdown tables where appropriate
              - Use bold, headers, bullet points
              
              Return ONLY valid JSON array.`
            }]
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to generate pitch deck");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
            }
          } catch {
            continue;
          }
        }
      }

      const jsonMatch = fullContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const slidesData = JSON.parse(jsonMatch[0]);
        const processedSlides = slidesData.map((slide: { title: string; content: string }) => ({
          ...slide,
          icon: slideIcons[slide.title] || Presentation
        }));
        setSlides(processedSlides);
        setCurrentSlide(0);
        toast({
          title: "Pitch Deck Generated!",
          description: "Your investor presentation is ready.",
        });
      }
    } catch (error) {
      console.error("Pitch deck error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (slides.length === 0) return;
    
    const deckContent = slides.map((slide, i) => `
SLIDE ${i + 1}: ${slide.title.toUpperCase()}
${"=".repeat(50)}

${slide.content}

`).join("\n\n");

    const blob = new Blob([deckContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${companyName.replace(/\s+/g, '-').toLowerCase()}-pitch-deck.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12 container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="font-display text-5xl font-bold mb-4 glow-text">
              Pitch Deck Generator
            </h1>
            <p className="text-xl text-muted-foreground">
              Create investor-ready presentations with AI
            </p>
          </div>

          {slides.length === 0 ? (
            /* Input Form */
            <div className="max-w-3xl mx-auto glass-strong p-8 rounded-2xl space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-base">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company name"
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-base">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saas">SaaS / Software</SelectItem>
                      <SelectItem value="fintech">Fintech</SelectItem>
                      <SelectItem value="healthtech">Healthtech</SelectItem>
                      <SelectItem value="ecommerce">E-Commerce</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                      <SelectItem value="ai">AI / ML</SelectItem>
                      <SelectItem value="consumer">Consumer</SelectItem>
                      <SelectItem value="b2b">B2B Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stage" className="text-base">Funding Stage</Label>
                  <Select value={stage} onValueChange={setStage}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="series-a">Series A</SelectItem>
                      <SelectItem value="series-b">Series B</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundingGoal" className="text-base">Funding Goal</Label>
                  <Input
                    id="fundingGoal"
                    value={fundingGoal}
                    onChange={(e) => setFundingGoal(e.target.value)}
                    placeholder="e.g., $2M seed round"
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemStatement" className="text-base">Problem Statement *</Label>
                <Textarea
                  id="problemStatement"
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="What problem are you solving? Who feels this pain?"
                  className="bg-background/50 border-border/50 focus:border-primary min-h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution" className="text-base">Your Solution *</Label>
                <Textarea
                  id="solution"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="How does your product/service solve this problem?"
                  className="bg-background/50 border-border/50 focus:border-primary min-h-24"
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
                    Generating Pitch Deck...
                  </>
                ) : (
                  <>
                    <Presentation className="w-5 h-5" />
                    Generate Pitch Deck
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* Slide Viewer */
            <div className="space-y-6">
              {/* Slide Navigation Dots */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {slides.map((slide, index) => {
                  const Icon = slide.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                        currentSlide === index 
                          ? "bg-primary text-primary-foreground" 
                          : "glass hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden md:inline">{slide.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Current Slide */}
              <div className="glass-strong p-8 md:p-12 rounded-2xl min-h-[500px] relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    className={cardinalButtonVariants({ variant: "hero" })}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button
                    onClick={() => setSlides([])}
                    size="sm"
                    variant="outline"
                    className="glass"
                  >
                    New Deck
                  </Button>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-4 mb-8">
                    {(() => {
                      const Icon = slides[currentSlide].icon;
                      return <Icon className="w-10 h-10 text-primary" />;
                    })()}
                    <h2 className="font-display text-4xl font-bold">
                      {slides[currentSlide].title}
                    </h2>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <MessageRenderer content={slides[currentSlide].content} />
                  </div>
                </div>

                {/* Slide Navigation */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                  <Button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    variant="outline"
                    size="icon"
                    className="glass"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentSlide + 1} / {slides.length}
                  </span>
                  <Button
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    variant="outline"
                    size="icon"
                    className="glass"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
