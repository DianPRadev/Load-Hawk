import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAuth, rateLimit, sanitize } from "./_auth";

const HF_API_KEY = process.env.HF_API_KEY;
const MODEL = "deepseek-ai/DeepSeek-V3";
const API_URL = "https://router.huggingface.co/together/v1/chat/completions";

if (!HF_API_KEY) console.error("MISSING ENV: HF_API_KEY");

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
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Auth check
  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  // Rate limit: 10 AI requests per minute per IP
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || "unknown";
  if (!rateLimit(ip, 10, 60_000)) return res.status(429).json({ error: "Too many requests. Please wait a moment." });

  if (!HF_API_KEY) return res.status(500).json({ error: "AI service not configured" });

  const { message, load, history } = req.body as {
    message: string;
    load?: LoadContext;
    history?: { role: string; content: string }[];
  };

  const cleanMessage = sanitize(message, 1000);
  if (!cleanMessage) return res.status(400).json({ error: "Message is required" });

  // Sanitize load context
  let loadContext = "";
  if (load) {
    const parts: string[] = [];
    if (load.origin && load.destination) parts.push(`Route: ${sanitize(load.origin, 100)} → ${sanitize(load.destination, 100)}`);
    if (typeof load.miles === "number" && load.miles > 0) parts.push(`Distance: ${load.miles} miles`);
    if (typeof load.rate === "number" && load.rate > 0) parts.push(`Rate: $${load.rate}`);
    if (typeof load.ratePerMile === "number" && load.ratePerMile > 0) parts.push(`Rate/mile: $${load.ratePerMile.toFixed(2)}`);
    if (load.equipment) parts.push(`Equipment: ${sanitize(load.equipment, 50)}`);
    if (load.broker) parts.push(`Broker: ${sanitize(load.broker, 100)}`);
    if (typeof load.brokerRating === "number") parts.push(`Broker rating: ${load.brokerRating}/5`);
    if (parts.length > 0) loadContext = `\n\nCurrent load context:\n${parts.join("\n")}`;
  }

  // Sanitize history
  const cleanHistory = (history || []).slice(-10).map((m) => ({
    role: m.role === "ai" ? "assistant" : (m.role === "user" ? "user" : "assistant"),
    content: sanitize(m.content, 2000),
  }));

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT + loadContext },
    ...cleanHistory,
    { role: "user" as const, content: cleanMessage },
  ];

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: MODEL, messages, max_tokens: 800, temperature: 0.7 }),
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
