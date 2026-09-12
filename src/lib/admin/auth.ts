import { headers } from "next/headers";
import { timingSafeEqualString } from "./session";

/**
 * The login side of the admin (plan §5.5). One password, one admin, no user
 * table: `ADMIN_PASSWORD` in hPanel is the whole account system.
 */

export type LoginOutcome = "ok" | "wrong" | "throttled" | "unconfigured";

/**
 * Failed attempts per IP. Counted separately from `src/lib/rate-limit.ts`
 * because that limiter charges every call, and a correct password must never
 * spend one of the five tries (plan §5.5: five *failed* logins per 15 minutes).
 */
const FAILURE_LIMIT = 5;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; resetAt: number }>();

export function loginFailures(key: string, now = Date.now()): number {
  const bucket = failures.get(key);
  if (!bucket || bucket.resetAt <= now) return 0;
  return bucket.count;
}

export function isThrottled(key: string, now = Date.now()): boolean {
  return loginFailures(key, now) >= FAILURE_LIMIT;
}

export function recordFailure(key: string, now = Date.now()): void {
  if (failures.size > 1_000) {
    for (const [existing, bucket] of failures) {
      if (bucket.resetAt <= now) failures.delete(existing);
    }
  }
  const bucket = failures.get(key);
  if (!bucket || bucket.resetAt <= now) {
    failures.set(key, { count: 1, resetAt: now + FAILURE_WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

export function clearFailures(key: string): void {
  failures.delete(key);
}

/** Only for the tests — the map is process-local either way. */
export function resetFailures(): void {
  failures.clear();
}

export function checkPassword(candidate: string, key: string, now = Date.now()): LoginOutcome {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !process.env.ADMIN_SESSION_SECRET) return "unconfigured";
  if (isThrottled(key, now)) return "throttled";
  if (timingSafeEqualString(candidate, expected)) {
    clearFailures(key);
    return "ok";
  }
  recordFailure(key, now);
  return isThrottled(key, now) ? "throttled" : "wrong";
}

/** Best-effort client identity behind Hostinger's proxy, as the form routes do. */
export async function loginKey(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerList.get("x-real-ip") || "unknown";
  return `admin-login:${ip}`;
}
