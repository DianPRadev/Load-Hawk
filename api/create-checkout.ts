import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { verifyAuth, rateLimit, getSafeOrigin, getRateLimitKey } from "./_auth";

if (!process.env.STRIPE_SECRET_KEY) console.error("MISSING ENV: STRIPE_SECRET_KEY");
if (!process.env.STRIPE_PRICE_ID) console.error("MISSING ENV: STRIPE_PRICE_ID");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const PRICE_ID = process.env.STRIPE_PRICE_ID!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const rateLimitKey = getRateLimitKey(req, user);
  if (!rateLimit(rateLimitKey, 5, 60_000)) return res.status(429).json({ error: "Too many requests" });

  if (!process.env.STRIPE_SECRET_KEY || !PRICE_ID) {
    return res.status(500).json({ error: "Billing not configured" });
  }

  const safeOrigin = getSafeOrigin(req);

  try {
    // Find existing customer by supabase_user_id metadata first, then by email
    let customerId: string;
    const byMeta = await stripe.customers.search({
      query: `metadata['supabase_user_id']:'${user.id}'`,
      limit: 1,
    });

    if (byMeta.data.length > 0) {
      customerId = byMeta.data[0].id;
    } else {
      const byEmail = await stripe.customers.list({ email: user.email, limit: 1 });
      if (byEmail.data.length > 0) {
        customerId = byEmail.data[0].id;
        // Backfill metadata
        await stripe.customers.update(customerId, {
          metadata: { supabase_user_id: user.id },
        });
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${safeOrigin}/settings?upgraded=true`,
      cancel_url: `${safeOrigin}/pricing`,
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
