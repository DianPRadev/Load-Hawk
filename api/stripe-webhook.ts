import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-04-30.basil" });
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function updateSubscriptionTier(userId: string, tier: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) console.error("Failed to update tier:", error);
}

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // Read raw body for signature verification
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const rawBody = Buffer.concat(chunks);

  let event: Stripe.Event;

  if (WEBHOOK_SECRET) {
    const sig = req.headers["stripe-signature"] as string;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send("Webhook signature verification failed");
    }
  } else {
    // No webhook secret configured — parse event directly (dev mode)
    event = JSON.parse(rawBody.toString()) as Stripe.Event;
  }

  try {
    switch (event.type) {
      // Checkout completed — user just subscribed
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        if (userId) await updateSubscriptionTier(userId, "pro");
        break;
      }

      // Subscription created or resumed
      case "customer.subscription.created":
      case "customer.subscription.resumed": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (userId && sub.status === "active") await updateSubscriptionTier(userId, "pro");
        break;
      }

      // Subscription updated (upgrade, downgrade, status change)
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (userId) {
          const tier = (sub.status === "active" || sub.status === "trialing") ? "pro" : "free";
          await updateSubscriptionTier(userId, tier);
        }
        break;
      }

      // Subscription cancelled or paused
      case "customer.subscription.deleted":
      case "customer.subscription.paused": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (userId) await updateSubscriptionTier(userId, "free");
        break;
      }

      // Payment succeeded — renewal confirmed
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const userId = sub.metadata?.supabase_user_id;
          if (userId) await updateSubscriptionTier(userId, "pro");
        }
        break;
      }

      // Payment failed — flag the account
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const userId = sub.metadata?.supabase_user_id;
          if (userId && sub.status !== "active") await updateSubscriptionTier(userId, "free");
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
  }

  return res.status(200).json({ received: true });
}
