import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cardinalButtonVariants } from "@/components/ui/button-variants";
import { Send, Mic } from "lucide-react";
import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Welcome to Cardinal Business Genie. I'm your AI partner in building empires. How can I assist you with your business today?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm here to help with business strategy, LLC formation, branding, and more. This is a demo response - full AI integration coming soon with Lovable AI.",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-8 container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="glass-strong p-6 rounded-2xl mb-6">
            <h1 className="font-display text-3xl font-bold mb-2 glow-text">
              AI Business Consultant
            </h1>
            <p className="text-muted-foreground">
              Ask me anything about business formation, strategy, branding, and more
            </p>
          </div>
          
          {/* Chat Container */}
          <div className="glass-strong rounded-2xl overflow-hidden shadow-deep">
            {/* Messages */}
            <ScrollArea className="h-[60vh] p-6">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === "user"
                          ? "bg-gradient-cardinal text-white"
                          : "glass border border-border/50"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Input Area */}
            <div className="border-t border-border/50 p-4">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about LLC formation, branding, strategy..."
                  className="flex-1 bg-background/50 border-border/50 focus:border-cardinal-red"
                />
                <Button
                  onClick={handleSend}
                  className={cardinalButtonVariants({ variant: "hero", size: "icon" })}
                >
                  <Send className="w-5 h-5" />
                </Button>
                <Button
                  className={cardinalButtonVariants({ variant: "glass", size: "icon" })}
                >
                  <Mic className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              "Form an LLC",
              "Create a Brand",
              "Tax Structure",
              "Business Plan",
            ].map((action) => (
              <Button
                key={action}
                variant="outline"
                className="glass hover:glow-border"
                onClick={() => setInput(action)}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
