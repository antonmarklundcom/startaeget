import type { Comparison } from "@/lib/content/schema";
import { getPartner, isAffiliate, goHref } from "@/lib/affiliates";

/**
 * The money page (docs/design/verkstan.md §2). One white card per row rather
 * than a table: a five-column table cannot be read on a phone, and the phone is
 * where most of this traffic lands. The data shape in content/comparisons/*.ts
 * is untouched — S5 owns it — only the rendering changed.
 *
 * A sponsored row is recognisable as one: the CTA carries the peach Annonslänk
 * chip, unconditionally, whether or not the programme is enrolled yet.
 */

/** The badge cycles through four tints so neighbouring rows never collide. */
const BADGE_TINTS = ["mint", "sky", "sun", "lilac"] as const;

export function ComparisonTemplate({ comparison }: { comparison: Comparison }) {
  return (
    <section className="cmp" aria-labelledby="comparison-heading">
      <h2 id="comparison-heading">Jämförelsen i korthet</h2>

      <p className="cmp__head" aria-hidden="true">
        <span>Alternativ</span>
        <span>Pris</span>
        <span>Omdöme</span>
        <span>Till</span>
      </p>

      <ul className="cmp__rows">
        {comparison.rows.map((row, index) => {
          const partner = row.partnerId ? getPartner(row.partnerId) : null;
          return (
            <li className="cmp__row" key={row.id}>
              <div>
                <h3 className="cmp__name">{row.name}</h3>
                {row.badge ? (
                  <span
                    className="chip chip--tint cmp__badge"
                    data-tint={BADGE_TINTS[index % BADGE_TINTS.length]}
                  >
                    {row.badge}
                  </span>
                ) : null}
              </div>

              <div>
                <p className="cmp__price">{row.price}</p>
                <p className="cmp__free">{row.freeTier}</p>
              </div>

              <div>
                <p className="cmp__verdict">{row.verdict}</p>
                <p className="cmp__best">
                  <strong>Bäst för</strong> {row.bestFor}
                </p>
                <p className="cmp__traits">
                  Styrka {row.highlight} · Svaghet {row.drawback}
                </p>
                {row.sourceUrl ? (
                  <a
                    className="cmp__source"
                    href={row.sourceUrl}
                    rel="noopener"
                    target="_blank"
                  >
                    Pris kontrollerat hos {row.name}
                    {row.sourceDate ? ` ${row.sourceDate}` : ""}
                  </a>
                ) : null}
              </div>

              <div className="cmp__actions">
                {partner ? (
                  <>
                    <a
                      className="btn btn--dark btn--small"
                      href={goHref(partner.id)}
                      rel={
                        isAffiliate(partner)
                          ? "sponsored nofollow noopener"
                          : "nofollow noopener"
                      }
                      target="_blank"
                    >
                      {partner.cta}
                    </a>
                    <span
                      className={`chip ${partner.disclosure === "Annonslänk" ? "chip--ad" : "chip--source"}`}
                    >
                      {partner.disclosure}
                    </span>
                  </>
                ) : row.sourceUrl ? (
                  <a
                    className="btn btn--ghost btn--small"
                    href={row.sourceUrl}
                    rel="nofollow noopener"
                    target="_blank"
                  >
                    Läs mer
                  </a>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
