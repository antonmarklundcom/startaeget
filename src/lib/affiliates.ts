import { partners, type Partner, type PartnerCategory } from "../../content/affiliates";

/**
 * Access layer for the partner registry. Components and the /go/ handler use
 * these helpers so no page ever links straight to a partner URL — every click
 * goes through /go/<id> and is logged.
 */

const byId = new Map(partners.map((p) => [p.id, p]));

const duplicates = partners.length - byId.size;
if (duplicates > 0) {
  throw new Error(`content/affiliates.ts: ${duplicates} duplicate partner id(s)`);
}

export function getPartner(id: string): Partner | null {
  return byId.get(id) ?? null;
}

export function getPartners(ids: readonly string[]): Partner[] {
  return ids.map((id) => byId.get(id)).filter((p): p is Partner => Boolean(p));
}

export function getPartnersByCategory(category: PartnerCategory): Partner[] {
  return partners.filter((p) => p.category === category);
}

export function allPartners(): Partner[] {
  return partners;
}

/** Where /go/<id> actually sends the visitor. */
export function partnerDestination(partner: Partner): string {
  return partner.affiliateUrl?.trim() || partner.fallback || partner.url;
}

/** True when the link earns us money and must be marked "Annonslänk" (§1.2). */
export function isAffiliate(partner: Partner): boolean {
  return Boolean(partner.affiliateUrl?.trim());
}

export function goHref(id: string): string {
  return `/go/${id}/`;
}

export type { Partner, PartnerCategory };
