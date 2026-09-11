import type { Comparison } from "@/lib/content/schema";
import { COMPARISON_COLUMNS } from "@/lib/content/schema";
import { Annonslank } from "@/components/Annonslank";

/**
 * The money page's table (plan §5.2). Five fixed columns, one verdict per row,
 * a "bäst för" badge, and — because a sponsored row must be recognisable as one
 * — the partner name itself is the marked Annonslänk.
 *
 * Wide on purpose: the table scrolls inside its own box so the page never does.
 */
export function ComparisonTemplate({ comparison }: { comparison: Comparison }) {
  return (
    <section className="comparison" aria-labelledby="comparison-heading">
      <h2 id="comparison-heading">Jämförelsen i korthet</h2>

      <div className="comparison__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Alternativ</th>
              {COMPARISON_COLUMNS.map((column) => (
                <th key={column.key} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">
                  {row.partnerId ? (
                    <Annonslank partner={row.partnerId}>{row.name}</Annonslank>
                  ) : (
                    row.name
                  )}
                  {row.badge ? (
                    <>
                      <br />
                      <span className="comparison__badge">{row.badge}</span>
                    </>
                  ) : null}
                </th>
                {COMPARISON_COLUMNS.map((column) => (
                  <td key={column.key}>{row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="comparison__verdicts">
        {comparison.rows.map((row) => (
          <div className="comparison__verdict" key={row.id}>
            <h3>
              {row.name}
              {row.badge ? ` — ${row.badge}` : ""}
            </h3>
            <p>{row.verdict}</p>
            {row.sourceUrl ? (
              <a className="comparison__source" href={row.sourceUrl} rel="noopener" target="_blank">
                Pris kontrollerat hos {row.name}
                {row.sourceDate ? ` ${row.sourceDate}` : ""}
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
