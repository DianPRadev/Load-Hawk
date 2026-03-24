import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { verifyAuth, rateLimit, getSafeOrigin, getRateLimitKey } from "./_auth";

if (!process.env.STRIPE_SECRET_KEY) console.error("MISSING ENV: STRIPE_SECRET_KEY");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const rateLimitKey = getRateLimitKey(req, user);
  if (!rateLimit(rateLimitKey, 5, 60_000)) return res.status(429).json({ error: "Too many requests" });

  const safeOrigin = getSafeOrigin(req);

  try {
    // Find customer by supabase_user_id metadata first
    let customerId: string | null = null;
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
        await stripe.customers.update(customerId, {
          metadata: { supabase_user_id: user.id },
        });
      }
    }

    if (!customerId) {
      return res.status(404).json({ error: "No billing account found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${safeOrigin}/settings`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    return res.status(500).json({ error: "Failed to create billing portal" });
  }
}
