import Link from "next/link";
import type { Article } from "@/lib/content";
import type { Comparison } from "@/lib/content/schema";
import { COMPARISON_COLUMNS } from "@/lib/content/schema";
import { getHub } from "@/lib/content/site";
import { getArticleBySlug } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { PartnerCta } from "@/components/PartnerCta";
import { Annonslank } from "@/components/Annonslank";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/jsonld";
import { formatUpdated } from "@/lib/site";

/**
 * The article surface. O1 ships structure and data wiring only — O2 replaces
 * the markup with the designed template. The props are the contract.
 */
export function ArticleTemplate({
  article,
  comparison,
}: {
  article: Article;
  comparison?: Comparison | null;
}) {
  const fm = article.frontmatter;
  const hub = getHub(fm.hub);
  const crumbs = [
    { name: "Start", path: "/" },
    ...(hub ? [{ name: hub.h1, path: hub.path }] : []),
    { name: fm.title, path: `/${fm.slug}/` },
  ];
  const related = fm.related
    .map((slug) => getArticleBySlug(slug))
    .filter((a): a is Article => Boolean(a) && !a!.frontmatter.draft);

  return (
    <article className="container article">
      <JsonLd data={articleJsonLd(fm)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqJsonLd(fm.faq)} />

      <Breadcrumbs crumbs={crumbs} />
      <h1>{fm.title}</h1>
      <p className="article__updated">Uppdaterad {formatUpdated(fm.updated)}</p>

      <div className="prose">
        <Mdx source={article.body} />
      </div>

      {comparison ? <ComparisonTable comparison={comparison} /> : null}

      {fm.partners.length ? <PartnerCta partners={fm.partners} /> : null}

      {fm.faq.length ? (
        <section className="article__faq">
          <h2>Vanliga frågor</h2>
          <dl>
            {fm.faq.map((item) => (
              <div key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {fm.sources.length ? (
        <section className="article__sources">
          <h2>Källor</h2>
          <ul>
            {fm.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} rel="noopener" target="_blank">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length ? (
        <section className="article__related">
          <h2>Läs vidare</h2>
          <ul>
            {related.map((item) => (
              <li key={item.frontmatter.slug}>
                <Link href={`/${item.frontmatter.slug}/`}>{item.frontmatter.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

function ComparisonTable({ comparison }: { comparison: Comparison }) {
  return (
    <section className="comparison" aria-label="Jämförelsetabell">
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
                  {row.badge ? <span className="comparison__badge">{row.badge}</span> : null}
                </th>
                {COMPARISON_COLUMNS.map((column) => (
                  <td key={column.key}>{row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="comparison__verdicts">
        {comparison.rows.map((row) => (
          <li key={row.id}>
            <strong>{row.name}:</strong> {row.verdict}
          </li>
        ))}
      </ul>
    </section>
  );
}
