import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-04-30.basil" });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body as { email: string };
  if (!email) return res.status(400).json({ error: "email required" });

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
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
