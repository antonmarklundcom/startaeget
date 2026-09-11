/**
 * Minimal in-process rate limiter for the form routes. One Node process per
 * Hostinger slot, so an in-memory map is enough; it exists to stop a script
 * hammering the forms, not as a security boundary.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();

  // Keep the map from growing with every IP that ever posted a form.
  if (buckets.size > 5_000) {
    for (const [existing, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(existing);
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}

/** Best-effort client identity behind Hostinger's proxy. */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
