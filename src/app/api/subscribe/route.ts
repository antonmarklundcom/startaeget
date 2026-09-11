import { NextResponse } from "next/server";
import { z } from "zod";
import { withDb, schema, isDbConfigured } from "@/db";
import { rateLimit, clientKey } from "@/lib/rate-limit";

/** Newsletter sign-ups and lead-magnet downloads (plan §1.2 point 3). */

export const dynamic = "force-dynamic";

const subscribeSchema = z.object({
  email: z.string().email().max(320),
  source: z.string().max(200).default("/"),
  magnet: z.string().max(100).optional().or(z.literal("")),
  website: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "subscribe"))) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  if (data.website && data.website.trim() !== "") {
    return NextResponse.json({ ok: true, stored: false });
  }

  const stored = await withDb((db) =>
    db.insert(schema.subscribers).values({
      email: data.email,
      source: data.source,
      magnet: data.magnet || null,
    }),
  );

  // Double opt-in mail needs RESEND_API_KEY; without it the row is kept and the
  // confirmation is sent later (§4.5).
  const mailConfigured = Boolean(process.env.RESEND_API_KEY);
  if (!stored && !isDbConfigured()) {
    console.info("[subscribe] no DATABASE_URL configured, sign-up logged only");
  }

  return NextResponse.json({ ok: true, stored: Boolean(stored), mailConfigured });
}
