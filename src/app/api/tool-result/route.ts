import { NextResponse } from "next/server";
import { z } from "zod";
import { withDb, schema, isDbConfigured } from "@/db";
import { rateLimit, clientKey } from "@/lib/rate-limit";

/**
 * "Mejla mig resultatet" from the three tools (plan §3 approved extras). The
 * row doubles as a newsletter sign-up when the visitor ticks the box.
 */

export const dynamic = "force-dynamic";

const toolResultSchema = z.object({
  tool: z.enum(["bolagsform", "startkostnad", "vad-blir-kvar"]),
  email: z.string().email().max(320),
  payload: z.record(z.unknown()).default({}),
  subscribe: z.boolean().default(false),
  website: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "tool-result"))) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = toolResultSchema.safeParse(body);
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

  const payloadJson = JSON.stringify(data.payload).slice(0, 60_000);

  const stored = await withDb(async (db) => {
    await db.insert(schema.toolResults).values({
      tool: data.tool,
      email: data.email,
      payloadJson,
    });
    if (data.subscribe) {
      await db.insert(schema.subscribers).values({
        email: data.email,
        source: `verktyg/${data.tool}`,
        magnet: null,
      });
    }
    return true;
  });

  if (!stored && !isDbConfigured()) {
    console.info("[tool-result] no DATABASE_URL configured, result logged only");
  }

  return NextResponse.json({
    ok: true,
    stored: Boolean(stored),
    mailConfigured: Boolean(process.env.RESEND_API_KEY),
  });
}
