import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

/**
 * Idempotency: track processed event IDs to prevent duplicate processing.
 * In a production system, use a database table. This in-memory set handles
 * duplicates within a single serverless instance lifetime.
 */
const processedEvents = new Set<string>();
const MAX_PROCESSED_CACHE = 1000;

function markProcessed(eventId: string) {
  processedEvents.add(eventId);
  // Prevent unbounded growth
  if (processedEvents.size > MAX_PROCESSED_CACHE) {
    const first = processedEvents.values().next().value;
    if (first) processedEvents.delete(first);
  }
}

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

  if (!WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  const sig = req.headers["stripe-signature"] as string;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send("Webhook signature verification failed");
  }

  // Idempotency check — skip already-processed events
  if (processedEvents.has(event.id)) {
    return res.status(200).json({ received: true, deduplicated: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        if (userId) await updateSubscriptionTier(userId, "pro");
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.resumed": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (userId && sub.status === "active") await updateSubscriptionTier(userId, "pro");
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (userId) {
          const tier = (sub.status === "active" || sub.status === "trialing") ? "pro" : "free";
          await updateSubscriptionTier(userId, tier);
        }
        break;
      }

      case "customer.subscription.deleted":
      case "customer.subscription.paused": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (userId) await updateSubscriptionTier(userId, "free");
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const userId = sub.metadata?.supabase_user_id;
          if (userId) await updateSubscriptionTier(userId, "pro");
        }
        break;
      }

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

    // Mark as processed after successful handling
    markProcessed(event.id);
  } catch (err) {
    console.error("Webhook handler error:", err);
  }

  return res.status(200).json({ received: true });
}
