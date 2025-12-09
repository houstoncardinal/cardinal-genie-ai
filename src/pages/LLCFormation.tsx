import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cardinalButtonVariants } from "@/components/ui/button-variants";
import { Building, ArrowRight, ArrowLeft, CheckCircle, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface LLCData {
  companyName: string;
  state: string;
  businessType: string;
  owners: string;
  registeredAgent: string;
  address: string;
  purpose: string;
}

const steps = [
  { id: 1, title: "Company Name", description: "Choose your LLC name" },
  { id: 2, title: "State Selection", description: "Where to register" },
  { id: 3, title: "Business Details", description: "Type and ownership" },
  { id: 4, title: "Registered Agent", description: "Legal representative" },
  { id: 5, title: "Review & Generate", description: "Final review" },
];

const usStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

export default function LLCFormation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<LLCData>({
    companyName: "",
    state: "",
    businessType: "",
    owners: "",
    registeredAgent: "",
    address: "",
    purpose: "",
  });

  const updateField = (field: keyof LLCData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleGenerate = async () => {
    if (!formData.companyName || !formData.state) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

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
              content: `Generate LLC formation documents for:
              Company Name: ${formData.companyName} LLC
              State: ${formData.state}
              Business Type: ${formData.businessType}
              Number of Owners/Members: ${formData.owners}
              Registered Agent: ${formData.registeredAgent}
              Business Address: ${formData.address}
              Business Purpose: ${formData.purpose}
              
              Generate a comprehensive LLC formation package including:
              1. Articles of Organization template
              2. Operating Agreement template
              3. EIN Application guidance
              4. State-specific filing requirements for ${formData.state}
              5. Compliance checklist
              6. Estimated costs and timelines
              
              Format this as a professional document guide.`
            }]
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to generate LLC documents");
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

      setGeneratedDocs(fullContent);
      toast({
        title: "LLC Documents Generated!",
        description: "Your formation package is ready for review.",
      });
    } catch (error) {
      console.error("LLC generation error:", error);
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
    if (!generatedDocs) return;
    
    const blob = new Blob([generatedDocs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.companyName.replace(/\s+/g, '-').toLowerCase()}-llc-formation.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-base">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                placeholder="Enter your desired company name"
                className="bg-background/50 border-border/50 focus:border-cardinal-red text-lg"
              />
              <p className="text-sm text-muted-foreground">
                "LLC" will be automatically added to your company name
              </p>
            </div>
            <div className="glass p-4 rounded-lg">
              <h4 className="font-semibold text-cardinal-red mb-2">Naming Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Must be unique in your state</li>
                <li>• Cannot include restricted words</li>
                <li>• Should reflect your business</li>
              </ul>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="state" className="text-base">State of Formation *</Label>
              <Select value={formData.state} onValueChange={(v) => updateField("state", v)}>
                <SelectTrigger className="bg-background/50 border-border/50 text-lg">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {usStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="glass p-4 rounded-lg">
              <h4 className="font-semibold text-cardinal-red mb-2">Popular Choices:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Delaware</strong> - Best for investors & privacy</li>
                <li>• <strong>Wyoming</strong> - No state income tax, low fees</li>
                <li>• <strong>Nevada</strong> - Strong privacy protections</li>
                <li>• <strong>Your home state</strong> - Simplest option</li>
              </ul>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-base">Business Type</Label>
              <Select value={formData.businessType} onValueChange={(v) => updateField("businessType", v)}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consulting">Consulting & Professional Services</SelectItem>
                  <SelectItem value="ecommerce">E-Commerce & Retail</SelectItem>
                  <SelectItem value="technology">Technology & Software</SelectItem>
                  <SelectItem value="realestate">Real Estate & Property</SelectItem>
                  <SelectItem value="healthcare">Healthcare & Wellness</SelectItem>
                  <SelectItem value="creative">Creative & Media</SelectItem>
                  <SelectItem value="food">Food & Beverage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="owners" className="text-base">Number of Owners/Members</Label>
              <Select value={formData.owners} onValueChange={(v) => updateField("owners", v)}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="How many members?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Member (Just Me)</SelectItem>
                  <SelectItem value="two">Two Members</SelectItem>
                  <SelectItem value="multiple">Multiple Members (3+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose" className="text-base">Business Purpose</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => updateField("purpose", e.target.value)}
                placeholder="e.g., Software development and consulting"
                className="bg-background/50 border-border/50 focus:border-cardinal-red"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="registeredAgent" className="text-base">Registered Agent Name</Label>
              <Input
                id="registeredAgent"
                value={formData.registeredAgent}
                onChange={(e) => updateField("registeredAgent", e.target.value)}
                placeholder="Person or company to receive legal documents"
                className="bg-background/50 border-border/50 focus:border-cardinal-red"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-base">Business Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Street address in the state of formation"
                className="bg-background/50 border-border/50 focus:border-cardinal-red"
              />
            </div>
            <div className="glass p-4 rounded-lg">
              <h4 className="font-semibold text-cardinal-red mb-2">Registered Agent Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Must have physical address in formation state</li>
                <li>• Available during normal business hours</li>
                <li>• Can be yourself or a professional service</li>
              </ul>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="glass p-6 rounded-lg space-y-4">
              <h4 className="font-display text-xl font-bold text-cardinal-red">Review Your LLC Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Company Name:</span>
                  <p className="font-semibold">{formData.companyName || "Not set"} LLC</p>
                </div>
                <div>
                  <span className="text-muted-foreground">State:</span>
                  <p className="font-semibold">{formData.state || "Not set"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Business Type:</span>
                  <p className="font-semibold capitalize">{formData.businessType || "Not set"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Members:</span>
                  <p className="font-semibold capitalize">{formData.owners || "Not set"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Registered Agent:</span>
                  <p className="font-semibold">{formData.registeredAgent || "Not set"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Address:</span>
                  <p className="font-semibold">{formData.address || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12 container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="font-display text-5xl font-bold mb-4 glow-text">
              LLC Formation Wizard
            </h1>
            <p className="text-xl text-muted-foreground">
              Form your LLC with AI-powered guidance and document generation
            </p>
          </div>

          {!generatedDocs ? (
            <div className="glass-strong p-8 rounded-2xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center min-w-[100px]">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                          currentStep > step.id 
                            ? "bg-green-500 text-white" 
                            : currentStep === step.id 
                              ? "bg-gradient-cardinal text-white" 
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                      </div>
                      <span className={`text-xs mt-2 text-center ${
                        currentStep === step.id ? "text-cardinal-red font-semibold" : "text-muted-foreground"
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-1 w-12 mx-2 rounded ${
                        currentStep > step.id ? "bg-green-500" : "bg-muted"
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div className="min-h-[300px]">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="glass"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 5 ? (
                  <Button
                    onClick={nextStep}
                    className={cardinalButtonVariants({ variant: "hero" })}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={cardinalButtonVariants({ variant: "hero" })}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Building className="w-5 h-5" />
                        Generate LLC Documents
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-strong p-8 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">
                  {formData.companyName} LLC - Formation Package
                </h2>
                <Button
                  onClick={handleDownload}
                  className={cardinalButtonVariants({ variant: "hero" })}
                >
                  <FileText className="w-4 h-4" />
                  Download Documents
                </Button>
              </div>
              <div className="glass p-6 rounded-lg max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
                  {generatedDocs}
                </pre>
              </div>
              <Button
                onClick={() => {
                  setGeneratedDocs(null);
                  setCurrentStep(1);
                  setFormData({
                    companyName: "",
                    state: "",
                    businessType: "",
                    owners: "",
                    registeredAgent: "",
                    address: "",
                    purpose: "",
                  });
                }}
                variant="outline"
                className="mt-4 glass"
              >
                Start New LLC Formation
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
