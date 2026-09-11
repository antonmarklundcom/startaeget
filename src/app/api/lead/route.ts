import { NextResponse } from "next/server";
import { z } from "zod";
import { withDb, schema, isDbConfigured } from "@/db";
import { forwardLead, isVenderCrmConfigured } from "@/lib/vendercrm";
import { rateLimit, clientKey } from "@/lib/rate-limit";

/**
 * Byrå offer requests and the contact form (plan §1.2, §2.4).
 *
 * Order matters: write our own row first, then try VenderCRM. If the CRM is
 * unreachable or unconfigured the lead is still ours, and `forwarded_at` stays
 * null so it can be replayed later.
 */

export const dynamic = "force-dynamic";

const leadSchema = z.object({
  type: z.enum(["byra", "kontakt"]).default("byra"),
  name: z.string().min(2).max(200),
  email: z.string().email().max(320),
  phone: z.string().min(6).max(30).optional().or(z.literal("")),
  companyForm: z.string().max(40).optional().or(z.literal("")),
  message: z.string().max(5000).optional().or(z.literal("")),
  sourcePage: z.string().max(500).default("/"),
  /** Honeypot — bots fill it in, humans never see it. */
  website: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "lead"))) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot hit: answer exactly like a success and store nothing.
  if (data.website && data.website.trim() !== "") {
    return NextResponse.json({ ok: true, stored: false });
  }

  const row = {
    type: data.type,
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    companyForm: data.companyForm || null,
    message: data.message || null,
    sourcePage: data.sourcePage,
  };

  const stored = await withDb((db) => db.insert(schema.leads).values(row));
  if (!stored && !isDbConfigured()) {
    console.info("[lead] no DATABASE_URL configured, lead logged only:", {
      ...row,
      email: "redacted",
    });
  }

  let forwarded = false;
  if (data.phone) {
    forwarded = await forwardLead({
      phone: data.phone,
      name: data.name,
      email: data.email,
      message: data.message || undefined,
      source: `site:startaegetforetag.se/${data.type}`,
      pageUrl: data.sourcePage,
      referrer: request.headers.get("referer") ?? undefined,
      fields: data.companyForm ? { bolagsform: data.companyForm } : undefined,
    });
  }

  return NextResponse.json({
    ok: true,
    stored: Boolean(stored),
    forwarded,
    crmConfigured: isVenderCrmConfigured(),
  });
}
