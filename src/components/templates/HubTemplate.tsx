import Link from "next/link";
import type { HubDef } from "@/lib/content/site";
import type { Article } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { NewsletterBand } from "@/components/SiteFooter";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { tools } from "@/lib/content/site";
import { formatUpdated } from "@/lib/site";

/**
 * A hub is an SEO surface in its own right (plan §3): intro, the one guide we
 * would hand a beginner first, a tool card, then everything else in the hub.
 */
export function HubTemplate({ hub, articles }: { hub: HubDef; articles: Article[] }) {
  const crumbs = [
    { name: "Start", path: "/" },
    { name: hub.h1, path: hub.path },
  ];

  // `featured` names slugs; a slug a content phase has not written yet simply
  // drops out, so the hub never links to a page that does not exist.
  const featured = hub.featured
    .map((slug) => articles.find((a) => a.frontmatter.slug === slug))
    .filter((a): a is Article => Boolean(a));
  const rest = articles.filter((a) => !featured.includes(a));

  return (
    <div className="container hub">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />

      <p className="eyebrow">Guidesamling</p>
      <h1>{hub.h1}</h1>
      <p className="hub__intro">{hub.intro}</p>

      {featured.map((article) => (
        <section className="hub__featured" key={article.frontmatter.slug}>
          <p className="eyebrow">Börja här</p>
          <h2>
            <Link href={`/${article.frontmatter.slug}/`}>{article.frontmatter.title}</Link>
          </h2>
          <p>{article.frontmatter.description}</p>
          <Link className="btn btn--primary" href={`/${article.frontmatter.slug}/`}>
            Läs guiden
          </Link>
        </section>
      ))}

      {rest.length ? (
        <ul className="card-grid">
          {rest.map((article) => (
            <li className="card" key={article.frontmatter.slug}>
              <h2>
                <Link href={`/${article.frontmatter.slug}/`}>
                  {article.frontmatter.title}
                </Link>
              </h2>
              <p>{article.frontmatter.description}</p>
              <p className="card__meta">
                Uppdaterad {formatUpdated(article.frontmatter.updated)}
              </p>
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

      <section className="section no-print" aria-labelledby="hub-tools-heading">
        <div className="section__head">
          <h2 id="hub-tools-heading">Räkna själv innan du bestämmer dig</h2>
        </div>
        <ul className="card-grid card-grid--3">
          {tools.map((tool) => (
            <li className="card" key={tool.id}>
              <h3>
                <Link href={tool.path}>{tool.title}</Link>
              </h3>
              <p>{tool.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <NewsletterBand source={hub.path} />
    </div>
  );
}
