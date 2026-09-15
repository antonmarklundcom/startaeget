import Link from "next/link";
import type { Article } from "@/lib/content";
import type { Comparison } from "@/lib/content/schema";
import { getHub } from "@/lib/content/site";
import { getArticleBySlug } from "@/lib/content";
import { getPartners, isAffiliate, goHref } from "@/lib/affiliates";
import { Mdx } from "@/components/Mdx";
import { Toc } from "@/components/Toc";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { NewsletterStrip } from "@/components/SiteFooter";
import { ComparisonTemplate } from "./ComparisonTemplate";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/jsonld";
import { formatUpdated } from "@/lib/site";
import { comparisonHasAds } from "@/lib/content/presentation";

/**
 * The article surface (docs/design/verkstan.md §2). Everything on it is driven
 * by frontmatter, so a content phase produces a finished page by writing MDX and
 * nothing else — including which pages get the byrå lead form.
 *
 * The head panel wears the hub's tint through data-hub, which is also what
 * colours the related pills and the "Vårt val" card further down.
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

  const pick = getPartners(fm.partners)[0] ?? null;
  const hasLeadForm = LEAD_FORM_HUBS.has(fm.hub);
  const marksAds = getPartners(fm.partners).some((partner) => partner.disclosure === "Annonslänk")
    || comparisonHasAds(comparison);
  const priceCheck = comparison?.rows.find((row) => row.sourceDate)?.sourceDate;

  return (
    <article className="container article" data-hub={fm.hub}>
      <JsonLd data={articleJsonLd(fm)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqJsonLd(fm.faq)} />

      <Breadcrumbs crumbs={crumbs} />

      <header className="head-panel">
        <p className="chip-row">
          <span className="chip chip--source">
            {priceCheck
              ? `Priser kontrollerade ${priceCheck}`
              : `Uppdaterad ${fm.updated.slice(0, 7)} · ${fm.sources.length} källor`}
          </span>
          {marksAds ? (
            <span className="chip chip--ad">Innehåller annonslänkar</span>
          ) : null}
        </p>
        <h1>{fm.title}</h1>
        <p className="lede">{fm.description}</p>
      </header>

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

        <aside className="article__aside no-print">
          <Toc body={article.body} />

          {pick ? (
            <div className="aside-card aside-card--mint">
              <h2>Vårt val</h2>
              <p>{pick.name}</p>
              <a
                className="btn btn--dark btn--small btn--block"
                href={goHref(pick.id)}
                rel={isAffiliate(pick) ? "sponsored nofollow noopener" : "nofollow noopener"}
                target="_blank"
              >
                {pick.cta}
              </a>
              <p
                className={`chip ${pick.disclosure === "Annonslänk" ? "chip--ad" : "chip--source"}`}
                style={{ marginBlockStart: "var(--space-1)" }}
              >
                {pick.disclosure}
              </p>
            </div>
          ) : null}

          <div className="aside-card aside-card--dark">
            <h2>Få offert från en redovisningsbyrå</h2>
            <p>Tre byråer svarar inom två dagar. Gratis och utan bindning.</p>
            <a
              className="btn btn--sun btn--small btn--block"
              href={hasLeadForm ? "#byra" : "/redovisningsbyra/"}
            >
              Få offert
            </a>
          </div>
        </aside>
      </div>

      {fm.sources.length ? (
        <section className="sources" id="kallor" aria-labelledby="sources-heading">
          <h2 id="sources-heading">Källor</h2>
          <ul>
            {fm.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} rel="noopener" target="_blank">
                  {source.label}
                </a>{" "}
                · hämtad {formatUpdated(fm.updated)}
              </li>
            ))}
          </ul>
          <p className="sources__note">
            Hittar du något som inte stämmer längre — hör av dig, vi rättar och daterar om
            sidan.
          </p>
        </section>
      ) : null}

      {related.length ? (
        <section className="related" aria-labelledby="related-heading">
          <h2 id="related-heading">Relaterade guider</h2>
          <ul className="related-pills">
            {related.map((item) => (
              <li key={item.frontmatter.slug} data-hub={item.frontmatter.hub}>
                <Link href={`/${item.frontmatter.slug}/`}>{item.frontmatter.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasLeadForm ? (
        <div className="related" id="byra">
          <LeadForm sourcePage={path} />
        </div>
      ) : null}

      <NewsletterStrip source={path} />
    </article>
  );
}
