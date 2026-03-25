import type { VercelRequest } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
);

/**
 * Allowed origins for redirect URLs (Stripe checkout, billing portal).
 */
const ALLOWED_ORIGINS = [
  "https://loadhawk.ai",
  "https://www.loadhawk.ai",
  "https://loadhawk-your-freight-navigator.vercel.app",
];

if (process.env.NODE_ENV === "development") {
  ALLOWED_ORIGINS.push("http://localhost:5173", "http://localhost:3000");
}

/**
 * Validate and return a safe origin for redirect URLs.
 * Falls back to the first allowed origin if the request origin is not whitelisted.
 */
export function getSafeOrigin(req: VercelRequest): string {
  const origin = req.headers.origin as string | undefined;
  if (origin && ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0];
}

/**
 * Verify the Supabase auth token from the Authorization header.
 * Returns the authenticated user or null.
 */
export async function verifyAuth(req: VercelRequest): Promise<{ id: string; email: string } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email || "" };
}

/**
 * Rate limiter with automatic cleanup.
 * Allows `maxRequests` per `windowMs` per key (user ID or IP).
 * Cleans up expired entries every 100 calls to prevent memory leaks.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
let cleanupCounter = 0;

function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}

export function rateLimit(key: string, maxRequests = 20, windowMs = 60_000): boolean {
  // Periodic cleanup to prevent memory leak
  cleanupCounter++;
  if (cleanupCounter >= 100) {
    cleanupCounter = 0;
    cleanupExpired();
  }

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

/**
 * Get rate limit key — prefer user ID over IP.
 */
export function getRateLimitKey(req: VercelRequest, user: { id: string } | null): string {
  if (user) return `user:${user.id}`;
  return `ip:${(req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || "unknown"}`;
}

/**
 * Sanitize string input — trim and limit length.
 * Strips control characters to prevent prompt injection.
 */
export function sanitize(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  // Remove control characters except newlines (\n=0x0A) and tabs (\t=0x09)
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, maxLength);
}
