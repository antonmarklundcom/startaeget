/**
 * The session token format, with no crypto in it at all (plan §5.5).
 *
 * `<expires>.<nonce>.<signature>` — the signed part is `expires.nonce`, exactly
 * as the plan specifies. This module is imported by both runtimes: the signing
 * itself lives in `session.ts` (Node, for route handlers and server components)
 * and `session-edge.ts` (Web Crypto, for `src/middleware.ts`), because Next runs
 * middleware on the Edge runtime where `node:crypto` does not exist.
 */

export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type ParsedToken = {
  /** Unix milliseconds. */
  expires: number;
  nonce: string;
  /** Base64url HMAC of `payload`. */
  signature: string;
  /** The exact bytes that were signed. */
  payload: string;
};

export function parseToken(token: string | undefined | null): ParsedToken | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [expiresRaw, nonce, signature] = parts;
  if (!/^\d+$/.test(expiresRaw) || !nonce || !signature) return null;
  return {
    expires: Number(expiresRaw),
    nonce,
    signature,
    payload: `${expiresRaw}.${nonce}`,
  };
}

export function isExpired(parsed: ParsedToken, now = Date.now()): boolean {
  return parsed.expires <= now;
}

/** The secret is required; an admin without one is an admin without a lock. */
export function sessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  return secret && secret.length >= 16 ? secret : null;
}

export function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
