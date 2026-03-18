import type { VercelRequest, VercelResponse } from "@vercel/node";

const HF_API_KEY = process.env.HF_API_KEY;
const MODEL = "deepseek-ai/DeepSeek-V3";
const API_URL = "https://router.huggingface.co/together/v1/chat/completions";

const SYSTEM_PROMPT = `You are LoadHawk AI, a freight negotiation assistant for truck owner-operators and carriers in the United States. You help drivers analyze loads, negotiate rates, and make profitable decisions.

Your capabilities:
- Analyze load profitability (rate per mile, fuel costs, tolls, net profit)
- Suggest counter-offer strategies with specific dollar amounts
- Provide broker intelligence and negotiation tips
- Calculate deadhead, fuel estimates, and true cost per mile
- Give call scripts and email templates for rate negotiations

Rules:
- Always be specific with numbers — never vague
- Use current national averages: diesel ~$3.89/gal, avg truck MPG ~6.5, avg toll rate ~3.3% of gross
- When given load details, calculate: fuel cost, toll estimate, net profit, effective rate per mile
- Keep responses concise and actionable — truckers are busy
- If asked about something outside freight/trucking, politely redirect to how you can help with their loads`;

interface LoadContext {
  origin?: string;
  destination?: string;
  miles?: number;
  rate?: number;
  ratePerMile?: number;
  equipment?: string;
  broker?: string;
  brokerRating?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!HF_API_KEY) {
    return res.status(500).json({ error: "AI service not configured" });
  }

  const { message, load, history } = req.body as {
    message: string;
    load?: LoadContext;
    history?: { role: string; content: string }[];
  };

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  // Build context from load data
  let loadContext = "";
  if (load) {
    const parts: string[] = [];
    if (load.origin && load.destination) parts.push(`Route: ${load.origin} → ${load.destination}`);
    if (load.miles) parts.push(`Distance: ${load.miles} miles`);
    if (load.rate) parts.push(`Rate: $${load.rate.toLocaleString()}`);
    if (load.ratePerMile) parts.push(`Rate/mile: $${load.ratePerMile.toFixed(2)}`);
    if (load.equipment) parts.push(`Equipment: ${load.equipment}`);
    if (load.broker) parts.push(`Broker: ${load.broker}`);
    if (load.brokerRating) parts.push(`Broker rating: ${load.brokerRating}/5`);
    if (parts.length > 0) {
      loadContext = `\n\nCurrent load context:\n${parts.join("\n")}`;
    }
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT + loadContext },
    ...(history || []).slice(-10).map((m) => ({
      role: m.role === "ai" ? "assistant" : m.role,
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("HF API error:", response.status, errText);
      return res.status(502).json({ error: "AI service temporarily unavailable" });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return res.status(200).json({ response: content });
  } catch (err) {
    console.error("Negotiate API error:", err);
    return res.status(500).json({ error: "Failed to generate AI response" });
  }
}
