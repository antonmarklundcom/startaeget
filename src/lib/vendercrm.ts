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
  fields?: Record<string, string>;
};

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
  const payload: Record<string, unknown> = {
    phone: lead.phone,
    idempotency_key: idempotencyKey(lead.phone),
  };
  // Omit empty optional fields rather than sending "" — the API rejects those.
  if (lead.name) payload.name = lead.name;
  if (lead.email) payload.email = lead.email;
  if (lead.message) payload.message = lead.message;
  if (lead.source) payload.source = lead.source;
  if (lead.pageUrl) payload.page_url = lead.pageUrl;
  if (lead.referrer) payload.referrer = lead.referrer;
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
