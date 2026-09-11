import Link from "next/link";
import type { Metadata } from "next";
import { home, hubs, tools } from "@/lib/content/site";
import {
  getPublishedArticles,
  getComparisonArticles,
  getArticlesByHub,
} from "@/lib/content";
import type { Hub } from "@/lib/content/schema";
import { NewsletterBand } from "@/components/SiteFooter";
import { HeroToolSlot } from "@/components/home/HeroToolSlot";
import { buildMetadata } from "@/lib/seo";
import { formatUpdated } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: home.metaTitle,
  description: home.metaDescription,
  path: "/",
});

/**
 * Home (docs/design/verkstan.md §2): gradient hero with the Bolagsformsväljaren's
 * first question live in the tool card, the three tools in their tints, the six
 * rooms with their real article counts, two sand panels, the sun band.
 *
 * Every count and every row comes from the loaders. Nothing on this page is a
 * number we made up (plan §4.16) — the hero chip says what is true instead of
 * counting visitors we cannot count.
 */
export default function HomePage() {
  const comparisons = getComparisonArticles();
  const comparisonSlugs = new Set(comparisons.map((a) => a.frontmatter.slug));
  const guides = getPublishedArticles()
    .filter((a) => !comparisonSlugs.has(a.frontmatter.slug))
    .slice(0, 4);

  /** Real published-article counts per room; "comparisons" hubs count those. */
  const countFor = (hubId: string, kind: string) =>
    kind === "comparisons"
      ? comparisons.length
      : getArticlesByHub(hubId as Hub).length;

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div>
            <p className="chip hero__chip">
              <span className="hero__dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              Gratis verktyg · inga konton · källa på varje siffra
            </p>
            <h1>{home.heroHeading}</h1>
            <p className="hero__intro">{home.heroIntro}</p>
            <div className="hero__actions">
              <Link className="btn btn--primary" href={home.heroCta.href}>
                {home.heroCta.label}
              </Link>
              <Link className="btn btn--ghost" href="/verktyg/">
                Se alla verktyg
              </Link>
            </div>
          </div>

          <HeroToolSlot />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <div>
              <h2>Välj verktyg</h2>
              <p>Tre räknare. Samma siffror, samma källor, inga konton.</p>
            </div>
            <Link className="section__more" href="/verktyg/">
              Alla verktyg
            </Link>
          </div>
          <ul className="tool-cards">
            {tools.map((tool, index) => (
              <li key={tool.id}>
                <Link className="tool-card" data-tint={tool.tint} href={tool.path}>
                  <span className="tool-card__tile" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="tool-card__title">{tool.title}</h3>
                  <p className="tool-card__desc">{tool.description}</p>
                  <span className="tool-card__foot">
                    <span className="tool-card__minutes">{tool.minutes} minuter</span>
                    <span className="tool-card__go">Starta</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>Sex rum. Gå in där du står just nu.</h2>
          </div>
          <ul className="rooms">
            {hubs
              .filter((hub) => hub.kind !== "comparisons")
              .map((hub) => {
                const count = countFor(hub.id, hub.kind);
                return (
                  <li key={hub.id}>
                    <Link className="room" data-tint={hub.tint} href={hub.path}>
                      <span className="room__dot" aria-hidden="true" />
                      <h3 className="room__title">{hub.h1}</h3>
                      <p className="room__desc">{hub.description}</p>
                      {count > 0 ? (
                        <span className="room__count">{count} guider</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      </section>

      {guides.length || comparisons.length ? (
        <section className="section">
          <div className="container panels">
            {guides.length ? (
              <div className="panel">
                <h2>Mest lästa guider</h2>
                <ul className="rows">
                  {guides.map((article) => (
                    <li key={article.frontmatter.slug}>
                      <Link className="row" href={`/${article.frontmatter.slug}/`}>
                        <span className="row__title">{article.frontmatter.title}</span>
                        <span className="row__arrow" aria-hidden="true">
                          →
                        </span>
                        <span className="row__meta">
                          Uppdaterad {formatUpdated(article.frontmatter.updated)}
                          {article.frontmatter.sources[0]
                            ? ` · ${article.frontmatter.sources[0].label}`
                            : ""}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {comparisons.length ? (
              <div className="panel">
                <h2>Jämförelser</h2>
                <ul className="rows">
                  {comparisons.slice(0, 4).map((article) => (
                    <li key={article.frontmatter.slug}>
                      <Link className="row" href={`/${article.frontmatter.slug}/`}>
                        <span className="row__title">{article.frontmatter.title}</span>
                        <span className="row__arrow" aria-hidden="true">
                          →
                        </span>
                        <span className="row__desc">{article.frontmatter.description}</span>
                        <span className="chip chip--ad row__chip">Annonslänkar</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="container">
        <NewsletterBand source="/" />
      </div>
    </>
  );
}
