import Link from "next/link";
import type { Article } from "@/lib/content";
import type { Comparison } from "@/lib/content/schema";
import { getHub } from "@/lib/content/site";
import { getArticleBySlug } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { Toc } from "@/components/Toc";
import { PartnerCta } from "@/components/PartnerCta";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { NewsletterBand } from "@/components/SiteFooter";
import { ComparisonTemplate } from "./ComparisonTemplate";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/jsonld";
import { formatUpdated } from "@/lib/site";

/**
 * The article surface. Everything on it is driven by frontmatter, so a content
 * phase produces a finished page by writing MDX and nothing else (plan §5.2) —
 * including which pages get the byrå lead form.
 */

/** Hubs where the reader is choosing an accountant, per plan §6.1 and §6.2. */
const LEAD_FORM_HUBS = new Set(["starta-foretag", "ekonomi"]);

export function ArticleTemplate({
  article,
  comparison,
}: {
  article: Article;
  comparison?: Comparison | null;
}) {
  const fm = article.frontmatter;
  const hub = getHub(fm.hub);
  const path = `/${fm.slug}/`;
  const crumbs = [
    { name: "Start", path: "/" },
    ...(hub ? [{ name: hub.h1, path: hub.path }] : []),
    { name: fm.title, path },
  ];
  const related = fm.related
    .map((slug) => getArticleBySlug(slug))
    .filter((a): a is Article => a !== null && !a.frontmatter.draft);

  return (
    <article className="container article">
      <JsonLd data={articleJsonLd(fm)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqJsonLd(fm.faq)} />

      <Breadcrumbs crumbs={crumbs} />

      <header className="article__head">
        {hub ? <p className="eyebrow">{hub.h1}</p> : null}
        <h1>{fm.title}</h1>
        <p className="lede">{fm.description}</p>
      </header>

      <p className="article__meta">
        <span>Uppdaterad {formatUpdated(fm.updated)}</span>
        {fm.sources.length ? (
          <span>
            <a href="#kallor">{fm.sources.length} källor</a>
          </span>
        ) : null}
      </p>

      <div className="article__body">
        <div>
          <div className="prose">
            <Mdx source={article.body} />
          </div>

          {comparison ? <ComparisonTemplate comparison={comparison} /> : null}

          {fm.faq.length ? (
            <section className="faq" aria-labelledby="faq-heading">
              <h2 id="faq-heading">Vanliga frågor</h2>
              <dl>
                {fm.faq.map((item) => (
                  <div className="faq__item" key={item.q}>
                    <dt>{item.q}</dt>
                    <dd>{item.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>

        <aside className="article__aside">
          <Toc body={article.body} />
          {fm.partners.length ? <PartnerCta partners={fm.partners} /> : null}
        </aside>
      </div>

      {fm.sources.length ? (
        <section className="sources" id="kallor" aria-labelledby="sources-heading">
          <h2 id="sources-heading">Källor</h2>
          <p>
            Siffrorna på den här sidan är hämtade härifrån. Hittar du något som inte
            stämmer längre — hör av dig, vi rättar och daterar om sidan.
          </p>
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
        <section className="related" aria-labelledby="related-heading">
          <h2 id="related-heading">Läs vidare</h2>
          <ul className="card-grid">
            {related.map((item) => (
              <li className="card" key={item.frontmatter.slug}>
                <h3>
                  <Link href={`/${item.frontmatter.slug}/`}>{item.frontmatter.title}</Link>
                </h3>
                <p>{item.frontmatter.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {LEAD_FORM_HUBS.has(fm.hub) ? (
        <div className="related">
          <LeadForm sourcePage={path} />
        </div>
      ) : null}

      <NewsletterBand source={path} />
    </article>
  );
}
