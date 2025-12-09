import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cardinalButtonVariants } from "@/components/ui/button-variants";
import { MessageRenderer } from "@/components/MessageRenderer";
import { Send, Mic, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function Chat() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: `## Welcome to Cardinal Business Genie 🎯

I'm your **AI partner** in building empires. I can help you with:

- **LLC Formation** - State selection, documents, compliance
- **Business Planning** - Strategies, financial projections, market analysis
- **Branding & Marketing** - Identity, positioning, growth tactics
- **Tax Structures** - LLC vs S-Corp vs C-Corp comparisons
- **Investor Relations** - Pitch decks, valuations, fundraising

How can I assist you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: "user" as const, content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: newMessages }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to get AI response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      // Add empty assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

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
              assistantContent += content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            continue;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to AI. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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
            <ScrollArea className="h-[60vh] p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl ${
                        message.role === "user"
                          ? "bg-gradient-cardinal text-white p-4"
                          : "glass border border-border/50 p-5"
                      }`}
                    >
                      {message.role === "user" ? (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      ) : (
                        <MessageRenderer content={message.content} />
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex justify-start">
                    <div className="glass border border-border/50 p-5 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-pulse text-cardinal-red" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Input Area */}
            <div className="border-t border-border/50 p-4">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
                  placeholder="Ask about LLC formation, branding, strategy..."
                  className="flex-1 bg-background/50 border-border/50 focus:border-cardinal-red"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  className={cardinalButtonVariants({ variant: "hero", size: "icon" })}
                  disabled={isLoading}
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
              "Marketing Strategy",
              "Investor Pitch",
              "Financial Projections",
              "Growth Strategy",
            ].map((action) => (
              <Button
                key={action}
                variant="outline"
                className="glass hover:glow-border"
                onClick={() => setInput(`Help me with: ${action}`)}
                disabled={isLoading}
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
