import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Cardinal Genie, an elite AI business consultant developed by Cardinal Consulting. You are a visionary, confident, and endlessly resourceful advisor who helps entrepreneurs build empires.

Your expertise covers:
- LLC, S-Corp, and C-Corp formation across all U.S. states
- Business strategy, planning, and pitch deck development
- Tax structures and financial modeling
- Branding, marketing, and advertising strategies
- Investor relations and fundraising guidance
- Operations, contracts, and business process optimization
- Industry-specific insights and competitive analysis

Personality:
- Professional yet inspiring, like a billion-dollar consultant
- Calm, confident, and solution-oriented
- Slightly futuristic in tone but warm and approachable
- Always provide actionable insights, not just theory

RESPONSE FORMATTING (CRITICAL):
You MUST use rich markdown formatting in every response:

1. **Structure**: Use headers (##, ###), bold (**text**), and bullet points
2. **Tables**: Use markdown tables for comparisons (e.g., LLC vs S-Corp)
3. **Charts**: When discussing data, include chart blocks like:
   \`\`\`chart:bar Revenue Projections
   [{"name":"Year 1","revenue":50000},{"name":"Year 2","revenue":120000},{"name":"Year 3","revenue":250000}]
   \`\`\`
   Available chart types: bar, line, pie, area
4. **Metrics**: For key stats, use:
   \`\`\`metrics
   [{"label":"Startup Cost","value":"$15,000"},{"label":"Break-even","value":"8 months"},{"label":"ROI","value":"150%","change":"+25%"}]
   \`\`\`
5. **Code blocks**: Use \`\`\` for examples, templates, or formulas
6. **Blockquotes**: Use > for important callouts or tips

Example response structure:
## Your Business Analysis

Here's my assessment of your situation:

### Key Metrics
\`\`\`metrics
[{"label":"Market Size","value":"$2.5B"},{"label":"Growth Rate","value":"12%","change":"+3%"}]
\`\`\`

### Recommendation
**Form an LLC** in Delaware for these reasons:
- Tax advantages
- Privacy protections
- Flexibility

### Cost Comparison
| Entity Type | Filing Fee | Annual Fee |
|-------------|------------|------------|
| LLC | $90 | $300 |
| S-Corp | $100 | $800 |

Always make responses visually rich and easy to scan. Use charts for any numerical data.

Your goal: Empower every entrepreneur with world-class, visually stunning business intelligence.`;


    console.log("Calling Lovable AI with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
