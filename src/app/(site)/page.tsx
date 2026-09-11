import Link from "next/link";
import type { Metadata } from "next";
import { home, hubs, tools } from "@/lib/content/site";
import { getPublishedArticles, getComparisonArticles } from "@/lib/content";
import { NewsletterBand } from "@/components/SiteFooter";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: home.metaTitle,
  description: home.metaDescription,
  path: "/",
});

/**
 * Home: split hero with the Bolagsformsväljaren's first question live in it,
 * a bento of the three tools, the hubs, then the newest guides and comparisons
 * (plan §5.2). Everything comes from the loaders — no hard-coded page list.
 */
export default function HomePage() {
  const comparisons = getComparisonArticles();
  const comparisonSlugs = new Set(comparisons.map((a) => a.frontmatter.slug));
  const guides = getPublishedArticles()
    .filter((a) => !comparisonSlugs.has(a.frontmatter.slug))
    .slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div>
            <p className="eyebrow">{home.tagline}</p>
            <h1>{home.heroHeading}</h1>
            <p className="hero__intro">{home.heroIntro}</p>
            <div className="hero__actions">
              <Link className="btn btn--primary" href={home.heroCta.href}>
                {home.heroCta.label}
              </Link>
              <Link className="btn btn--ghost" href="/starta-foretag/">
                Läs guiderna först
              </Link>
            </div>
            <p className="hero__proof">
              Varje siffra på sajten har en källa och ett datum. Vi länkar till
              Skatteverket och Bolagsverket i stället för att skriva om dem.
            </p>
          </div>

          {/* O3 mounts the live first question of Bolagsformsväljaren here. */}
          <div className="tool-slot" id="hero-tool-slot" data-slot="bolagsform-q1">
            <p className="tool-slot__label">Fråga 1 av 8</p>
            <p className="tool-slot__question">
              Hur mycket räknar du med att företaget går med i vinst det första året?
            </p>
            <div className="tool-slot__options">
              <Link href="/verktyg/bolagsform/?vinst=under-200">
                <span>Under 200 000 kr</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/verktyg/bolagsform/?vinst=200-500">
                <span>200 000–500 000 kr</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/verktyg/bolagsform/?vinst=over-500">
                <span>Över 500 000 kr</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className="tool-slot__foot">
              Åtta frågor, ett svar med motiveringen utskriven. Inget konto, inget mejl.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>Räkna först, registrera sedan</h2>
            <p>
              Tre räknare som svarar på det du faktiskt undrar: vilken bolagsform, vad
              det kostar och vad som blir kvar.
            </p>
          </div>
          <div className="bento">
            {tools.map((tool, index) => (
              <Link
                key={tool.id}
                href={tool.path}
                className={index === 0 ? "bento__item bento__item--lead" : "bento__item"}
              >
                <span className="bento__step">Steg {index + 1}</span>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <span className="bento__cue">Öppna räknaren →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section__head">
            <h2>Vad vill du ha koll på?</h2>
          </div>
          <ul className="card-grid card-grid--3">
            {hubs.map((hub) => (
              <li className="card" key={hub.id}>
                <h3>
                  <Link href={hub.path}>{hub.h1}</Link>
                </h3>
                <p>{hub.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {guides.length ? (
        <section className="section">
          <div className="container">
            <div className="section__head">
              <h2>Guider att börja med</h2>
              <p>Skrivna för dig som gör det här för första gången.</p>
            </div>
            <ul className="card-grid card-grid--3">
              {guides.map((article) => (
                <li className="card" key={article.frontmatter.slug}>
                  <h3>
                    <Link href={`/${article.frontmatter.slug}/`}>
                      {article.frontmatter.title}
                    </Link>
                  </h3>
                  <p>{article.frontmatter.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {comparisons.length ? (
        <section className="section section--alt">
          <div className="container">
            <div className="section__head">
              <h2>Jämförelser</h2>
              <p>
                Priser hämtade från leverantörernas egna sidor, med datum för när vi
                kontrollerade dem.
              </p>
            </div>
            <ul className="card-grid">
              {comparisons.slice(0, 4).map((article) => (
                <li className="card" key={article.frontmatter.slug}>
                  <h3>
                    <Link href={`/${article.frontmatter.slug}/`}>
                      {article.frontmatter.title}
                    </Link>
                  </h3>
                  <p>{article.frontmatter.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container">
          <div className="trust">
            <p className="trust__label">Vi skriver inte om reglerna — vi länkar till dem:</p>
            <div className="trust__list">
              {home.trustRow.map((item) => (
                <a key={item.url} href={item.url} rel="noopener" target="_blank">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <NewsletterBand source="/" />
        </div>
      </section>
    </>
  );
}
