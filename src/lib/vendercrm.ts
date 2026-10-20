import { createHash } from "node:crypto";

/**
 * Forwards a lead to VenderCRM. The browser never talks to the CRM — this runs
 * server-side with the site key, per the vendercrm-lead-capture skill.
 *
 * Every failure mode (no key configured, CRM down, validation error) is logged
 * and swallowed: the visitor always gets a thank-you, and the row is already in
 * our own `leads` table.
 */

export type VenderCrmLead = {
  phone: string;
  name?: string;
  email?: string;
  message?: string;
  source?: string;
  pageUrl?: string;
  referrer?: string;
  /** First-touch attribution from the vc_attr cookie (readAttribution). */
  attribution?: Record<string, string>;
  fields?: Record<string, string>;
};

/**
 * Swedish input → E.164. The CRM normalises a bare local number with the
 * TENANT's default country, which is Paraguay for Anton's tenant: "070-123 45 67"
 * would become +59570… — a valid-looking, wrong contact. So the site sends
 * "+46…" itself. "+"/"00" numbers keep their own country. Null = not a number.
 */
export function toE164(raw: string): string | null {
  const trimmed = raw.trim();
  let digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) {
    // "+46 (0)70…" is common in Sweden: drop the trunk zero after the code.
    if (digits.startsWith("460")) digits = `46${digits.slice(3)}`;
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2);
    if (digits.startsWith("460")) digits = `46${digits.slice(3)}`;
  } else if (digits.startsWith("0")) {
    digits = `46${digits.slice(1)}`;
  } else if (!digits.startsWith("46")) {
    digits = `46${digits}`;
  }
  return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
}

/** First-touch cookie written by {VENDERCRM_URL}/vc-attribution.js. */
export function readAttribution(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string" && value) out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

/** Same, from a raw Cookie header. */
export function attributionFromCookieHeader(header: string | null): Record<string, string> {
  const part = header?.split(";").map((p) => p.trim()).find((p) => p.startsWith("vc_attr="));
  return readAttribution(part?.slice("vc_attr=".length));
}

const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"] as const;

export function isVenderCrmConfigured(): boolean {
  return Boolean(process.env.VENDERCRM_URL && process.env.VENDERCRM_API_KEY);
}

/** Stable per-submission key: the same phone within the same hour is one lead. */
export function idempotencyKey(phone: string): string {
  const hour = new Date().toISOString().slice(0, 13);
  return createHash("sha256").update(`${phone}|${hour}`).digest("hex").slice(0, 40);
}

export async function forwardLead(lead: VenderCrmLead): Promise<boolean> {
  if (!isVenderCrmConfigured()) return false;

  const base = process.env.VENDERCRM_URL!.replace(/\/+$/, "");
  const phone = toE164(lead.phone);
  if (!phone) {
    console.error("[vendercrm] skipped: phone is not a dialable number");
    return false;
  }
  const payload: Record<string, unknown> = {
    phone,
    idempotency_key: idempotencyKey(phone),
  };
  // Omit empty optional fields rather than sending "" — the API rejects those.
  if (lead.name) payload.name = lead.name;
  if (lead.email) payload.email = lead.email;
  if (lead.message) payload.message = lead.message;
  if (lead.source) payload.source = lead.source;
  const attr = lead.attribution ?? {};
  const pageUrl = attr.landing_page || lead.pageUrl;
  const referrer = attr.referrer || lead.referrer;
  if (pageUrl) payload.page_url = pageUrl.slice(0, 2000);
  if (referrer) payload.referrer = referrer.slice(0, 2000);
  for (const key of ATTRIBUTION_KEYS) if (attr[key]) payload[key] = attr[key].slice(0, 200);
  if (lead.fields && Object.keys(lead.fields).length) payload.fields = lead.fields;

  try {
    const response = await fetch(`${base}/api/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": process.env.VENDERCRM_API_KEY!,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 201 || response.status === 200) return true;

    const body = await response.text().catch(() => "");
    console.error(`[vendercrm] ${response.status}: ${body.slice(0, 500)}`);
    return false;
  } catch (error) {
    console.error("[vendercrm] forward failed:", error);
    return false;
  }
}
