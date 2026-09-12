import { SESSION_COOKIE, isExpired, parseToken, sessionSecret } from "./token";

/**
 * The same check as `session.ts`, written against Web Crypto so
 * `src/middleware.ts` can run it on the Edge runtime, where `node:crypto` does
 * not exist. `crypto.subtle.verify` does the comparison, so it is constant-time
 * here too; the unit test asserts the two modules accept and reject exactly the
 * same tokens.
 */

const encoder = new TextEncoder();

function fromBase64url(value: string): ArrayBuffer | null {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  try {
    const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  } catch {
    return null;
  }
}

export async function verifySessionTokenEdge(
  token: string | undefined | null,
  now = Date.now(),
): Promise<boolean> {
  const secret = sessionSecret();
  if (!secret) return false;
  const parsed = parseToken(token);
  if (!parsed || isExpired(parsed, now)) return false;
  const signature = fromBase64url(parsed.signature);
  if (!signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify("HMAC", key, signature, encoder.encode(parsed.payload));
}

export { SESSION_COOKIE };
