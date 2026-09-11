import { NextResponse, type NextRequest } from "next/server";
import { getPartner, partnerDestination } from "@/lib/affiliates";
import { withDb, schema } from "@/db";

/**
 * Affiliate redirect + click log (plan §2.1). Never cached, never indexed:
 * robots.ts disallows /go/ and next.config sends X-Robots-Tag: noindex.
 *
 * The click is logged best-effort — a missing or unreachable database must not
 * stop the visitor reaching the partner.
 */

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ partner: string }> },
) {
  const { partner: id } = await context.params;
  const partner = getPartner(id);

  if (!partner) {
    return NextResponse.redirect(new URL("/jamfor/", request.url), 302);
  }

  const sourcePage = request.headers.get("referer")?.slice(0, 500) ?? null;

  await withDb((db) =>
    db.insert(schema.affiliateClicks).values({ partnerId: partner.id, sourcePage }),
  );

  const response = NextResponse.redirect(partnerDestination(partner), 302);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
