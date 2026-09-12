import crypto from "node:crypto";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  base64url,
  isExpired,
  parseToken,
  sessionSecret,
} from "./token";

/**
 * Node-runtime session signing: HMAC-SHA256 over `expires.nonce` with
 * `ADMIN_SESSION_SECRET`, compared with `crypto.timingSafeEqual` (plan §5.5).
 * No JWT library — there is one claim, and it is the expiry.
 */

function sign(payload: string, secret: string): string {
  return base64url(crypto.createHmac("sha256", secret).update(payload).digest());
}

export function createSessionToken(now = Date.now()): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const expires = now + SESSION_TTL_MS;
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${expires}.${nonce}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined | null, now = Date.now()): boolean {
  const secret = sessionSecret();
  if (!secret) return false;
  const parsed = parseToken(token);
  if (!parsed || isExpired(parsed, now)) return false;
  return timingSafeEqualString(parsed.signature, sign(parsed.payload, secret));
}

/**
 * Hash both sides first: `timingSafeEqual` throws on a length mismatch, and the
 * length of a forged signature is not something we want to leak either.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  const left = crypto.createHash("sha256").update(a).digest();
  const right = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(left, right);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/admin",
  maxAge: SESSION_TTL_MS / 1000,
};

/** True when the caller carries a valid session cookie. */
export async function hasSession(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export { SESSION_COOKIE, SESSION_TTL_MS };
