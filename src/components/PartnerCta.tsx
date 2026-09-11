import { getPartners, isAffiliate, goHref } from "@/lib/affiliates";

/**
 * A block of partner call-to-actions, rendered from the article's `partners`
 * frontmatter or from an explicit list inside an MDX body. Every entry carries
 * its own marking, so the block is honest even when only some of the partners
 * are enrolled programmes.
 *
 * Unknown ids are skipped rather than thrown so a lane 2 typo never breaks the
 * build for every other page; the verify script catches them instead.
 */
export function PartnerCta({
  partners,
  heading = "Verktyg som gör det här enklare",
}: {
  partners: readonly string[];
  heading?: string;
}) {
  const entries = getPartners(partners);
  if (entries.length === 0) return null;

  return (
    <aside className="partner-cta no-print" aria-label={heading}>
      <h2>{heading}</h2>
      <p className="partner-cta__intro">
        Leverantörerna nedan passar det sidan handlar om. Vi väljer dem på funktion,
        inte på ersättning.
      </p>
      <ul>
        {entries.map((partner) => (
          <li key={partner.id}>
            <span className="partner-cta__name">{partner.name}</span>
            <a
              className="btn btn--secondary btn--block"
              href={goHref(partner.id)}
              rel={
                isAffiliate(partner) ? "sponsored nofollow noopener" : "nofollow noopener"
              }
              target="_blank"
            >
              {partner.cta}
            </a>
            <span className="partner-cta__disclosure">{partner.disclosure}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
