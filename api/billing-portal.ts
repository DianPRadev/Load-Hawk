import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { verifyAuth, rateLimit } from "./_auth";

if (!process.env.STRIPE_SECRET_KEY) console.error("MISSING ENV: STRIPE_SECRET_KEY");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Auth check — use verified user's email, not request body
  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  // Rate limit: 5 portal requests per minute
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || "unknown";
  if (!rateLimit(ip, 5, 60_000)) return res.status(429).json({ error: "Too many requests" });

  try {
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return res.status(404).json({ error: "No billing account found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${req.headers.origin}/settings`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    return res.status(500).json({ error: "Failed to create billing portal" });
  }
}
