import Link from "next/link";
import type { HubDef } from "@/lib/content/site";
import type { Article } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { NewsletterBand } from "@/components/SiteFooter";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { tools, getHub } from "@/lib/content/site";
import { formatUpdated } from "@/lib/site";

/**
 * A hub is an SEO surface in its own right (plan §3), and in "Verkstan" it is
 * also the room: the head panel carries the hub's tint, and so do the dots on
 * its cards. /jamfor/ is the same template with the comparison marking on.
 */
export function HubTemplate({ hub, articles }: { hub: HubDef; articles: Article[] }) {
  const crumbs = [
    { name: "Start", path: "/" },
    { name: hub.h1, path: hub.path },
  ];
  const isComparisons = hub.kind === "comparisons";

  // The chip counts what the room actually holds. /jamfor/ holds comparisons and
  // /blogg/ holds posts; every other room holds guides. Derived from the
  // articles rather than hard-coded per hub, so a new room labels itself.
  const countNoun = (() => {
    const one = articles.length === 1;
    if (isComparisons) return one ? "jämförelse" : "jämförelser";
    // "inlägg" is a neuter noun: same in the singular and the plural.
    if (articles.length && articles.every((a) => a.frontmatter.type === "post")) {
      return "inlägg";
    }
    return one ? "guide" : "guider";
  })();

  // `featured` names slugs; a slug a content phase has not written yet simply
  // drops out, so the hub never links to a page that does not exist.
  const featured = hub.featured
    .map((slug) => articles.find((a) => a.frontmatter.slug === slug))
    .filter((a): a is Article => Boolean(a));
  const rest = articles.filter((a) => !featured.includes(a));

  return (
    <div className="container hub" data-hub={hub.id}>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />

      <header className="head-panel">
        {articles.length ? (
          <p className="chip-row">
            <span className="chip">
              {articles.length} {countNoun}
            </span>
            {isComparisons ? (
              <span className="chip chip--ad">Innehåller annonslänkar</span>
            ) : null}
          </p>
        ) : null}
        <h1>{hub.h1}</h1>
        <p className="lede">{hub.intro}</p>
      </header>

      {featured.map((article) => (
        <section className="hub__featured" key={article.frontmatter.slug}>
          <p className="eyebrow">Börja här</p>
          <h2>{article.frontmatter.title}</h2>
          <p>{article.frontmatter.description}</p>
          <Link className="btn btn--dark" href={`/${article.frontmatter.slug}/`}>
            Läs guiden
          </Link>
        </section>
      ))}

      {rest.length ? (
        <ul className="guide-cards guide-cards--3">
          {rest.map((article) => (
            <li key={article.frontmatter.slug}>
              <Link
                className="guide-card"
                data-hub={getHub(article.frontmatter.hub)?.id ?? hub.id}
                href={`/${article.frontmatter.slug}/`}
              >
                <span className="guide-card__dot" aria-hidden="true" />
                <h2 className="guide-card__title">{article.frontmatter.title}</h2>
                <p className="guide-card__desc">{article.frontmatter.description}</p>
                <span className="guide-card__meta">
                  {isComparisons ? "Annonslänkar · " : ""}
                  Uppdaterad {formatUpdated(article.frontmatter.updated)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {!featured.length && !rest.length ? (
        <p className="hub__empty">
          Guiderna i den här delen publiceras löpande. Under tiden hittar du{" "}
          <Link href="/verktyg/">verktygen</Link> och{" "}
          <Link href="/jamfor/">jämförelserna</Link>.
        </p>
      ) : null}

      <section className="hub__section no-print" aria-labelledby="hub-tools-heading">
        <div className="section__head">
          <h2 id="hub-tools-heading">Räkna själv innan du bestämmer dig</h2>
        </div>
        <ul className="tool-cards tool-cards--compact">
          {tools.map((tool) => (
            <li key={tool.id}>
              <Link className="tool-card" data-tint={tool.tint} href={tool.path}>
                <h3 className="tool-card__title">{tool.title}</h3>
                <span className="tool-card__foot">
                  <span className="tool-card__minutes">{tool.minutes} minuter</span>
                  <span className="tool-card__go">Starta</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <NewsletterBand source={hub.path} />
    </div>
  );
}
