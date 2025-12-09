import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cardinalButtonVariants } from "@/components/ui/button-variants";
import { FileText, Download, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface BusinessPlanData {
  executiveSummary: string;
  companyDescription: string;
  marketAnalysis: string;
  organization: string;
  productService: string;
  marketing: string;
  financials: string;
  appendix: string;
}

export default function BusinessPlan() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [description, setDescription] = useState("");
  const [funding, setFunding] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<BusinessPlanData | null>(null);
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    "Executive Summary",
    "Company Description",
    "Market Analysis",
    "Organization",
    "Product/Service",
    "Marketing Strategy",
    "Financial Projections",
    "Appendix"
  ];

  const handleGenerate = async () => {
    if (!businessName || !industry || !businessModel) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setCurrentSection(0);

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
              content: `Generate a comprehensive business plan for:
              Business Name: ${businessName}
              Industry: ${industry}
              Business Model: ${businessModel}
              Target Market: ${targetMarket}
              Description: ${description}
              Funding Goal: ${funding}
              
              Provide a detailed business plan with these sections in JSON format:
              {
                "executiveSummary": "...",
                "companyDescription": "...",
                "marketAnalysis": "...",
                "organization": "...",
                "productService": "...",
                "marketing": "...",
                "financials": "...",
                "appendix": "..."
              }
              
              Make each section detailed and professional. Return ONLY valid JSON.`
            }]
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to generate business plan");
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
              // Update progress
              const progress = Math.min(Math.floor((fullContent.length / 4000) * 8), 7);
              setCurrentSection(progress);
            }
          } catch {
            continue;
          }
        }
      }

      // Parse the JSON response
      const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const planData = JSON.parse(jsonMatch[0]);
        setGeneratedPlan(planData);
        toast({
          title: "Business Plan Generated!",
          description: "Your comprehensive business plan is ready.",
        });
      } else {
        throw new Error("Could not parse business plan");
      }
    } catch (error) {
      console.error("Business plan error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setCurrentSection(8);
    }
  };

  const handleDownload = () => {
    if (!generatedPlan) return;
    
    const planText = `
BUSINESS PLAN: ${businessName.toUpperCase()}
${"=".repeat(50)}

EXECUTIVE SUMMARY
${"-".repeat(30)}
${generatedPlan.executiveSummary}

COMPANY DESCRIPTION
${"-".repeat(30)}
${generatedPlan.companyDescription}

MARKET ANALYSIS
${"-".repeat(30)}
${generatedPlan.marketAnalysis}

ORGANIZATION & MANAGEMENT
${"-".repeat(30)}
${generatedPlan.organization}

PRODUCTS & SERVICES
${"-".repeat(30)}
${generatedPlan.productService}

MARKETING STRATEGY
${"-".repeat(30)}
${generatedPlan.marketing}

FINANCIAL PROJECTIONS
${"-".repeat(30)}
${generatedPlan.financials}

APPENDIX
${"-".repeat(30)}
${generatedPlan.appendix}
`;

    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${businessName.replace(/\s+/g, '-').toLowerCase()}-business-plan.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="font-display text-5xl font-bold mb-4 glow-text">
              Business Plan Generator
            </h1>
            <p className="text-xl text-muted-foreground">
              AI-powered comprehensive business plans in minutes
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
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance & Fintech</SelectItem>
                    <SelectItem value="ecommerce">E-Commerce & Retail</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="realestate">Real Estate</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessModel" className="text-base">Business Model *</Label>
                <Select value={businessModel} onValueChange={setBusinessModel}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Select business model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="b2b">B2B (Business to Business)</SelectItem>
                    <SelectItem value="b2c">B2C (Business to Consumer)</SelectItem>
                    <SelectItem value="saas">SaaS (Software as a Service)</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="agency">Agency/Service</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetMarket" className="text-base">Target Market</Label>
                <Input
                  id="targetMarket"
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  placeholder="e.g., Small businesses, millennials, enterprises"
                  className="bg-background/50 border-border/50 focus:border-cardinal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="funding" className="text-base">Funding Goal</Label>
                <Input
                  id="funding"
                  value={funding}
                  onChange={(e) => setFunding(e.target.value)}
                  placeholder="e.g., $500,000 seed round"
                  className="bg-background/50 border-border/50 focus:border-cardinal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">Business Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your business idea, unique value proposition, and goals..."
                  className="bg-background/50 border-border/50 focus:border-cardinal-red min-h-32"
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
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Generate Business Plan
                  </>
                )}
              </Button>
            </div>

            {/* Preview/Progress Area */}
            <div className="glass-strong p-8 rounded-2xl">
              {!generatedPlan && !isGenerating && (
                <div className="text-center py-16 text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Your business plan will appear here</p>
                  <p className="text-sm mt-2">Fill in the details and click generate</p>
                </div>
              )}

              {isGenerating && (
                <div className="space-y-6">
                  <h3 className="text-xl font-display font-bold mb-6">Generating Your Plan...</h3>
                  {sections.map((section, index) => (
                    <div key={section} className="flex items-center gap-3">
                      {currentSection > index ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : currentSection === index ? (
                        <Loader2 className="w-5 h-5 animate-spin text-cardinal-red" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted" />
                      )}
                      <span className={currentSection >= index ? "text-foreground" : "text-muted-foreground"}>
                        {section}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {generatedPlan && (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-display font-bold">{businessName}</h3>
                    <Button
                      onClick={handleDownload}
                      className={cardinalButtonVariants({ variant: "hero" })}
                      size="sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>

                  {Object.entries(generatedPlan).map(([key, value]) => (
                    <div key={key} className="glass p-4 rounded-lg">
                      <h4 className="font-display text-cardinal-red font-semibold mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
