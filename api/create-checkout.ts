import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { verifyAuth, rateLimit } from "./_auth";

if (!process.env.STRIPE_SECRET_KEY) console.error("MISSING ENV: STRIPE_SECRET_KEY");
if (!process.env.STRIPE_PRICE_ID) console.error("MISSING ENV: STRIPE_PRICE_ID");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const PRICE_ID = process.env.STRIPE_PRICE_ID!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Auth check — use the verified user, not the request body
  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  // Rate limit: 5 checkout requests per minute
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || "unknown";
  if (!rateLimit(ip, 5, 60_000)) return res.status(429).json({ error: "Too many requests" });

  if (!process.env.STRIPE_SECRET_KEY || !PRICE_ID) {
    return res.status(500).json({ error: "Billing not configured" });
  }

  try {
    // Use the authenticated user's ID and email — NOT from request body
    const existing = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;

    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${req.headers.origin}/settings?upgraded=true`,
      cancel_url: `${req.headers.origin}/pricing`,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
