import Link from "next/link";
import type { Metadata } from "next";
import { home, hubs, tools } from "@/lib/content/site";
import { getPublishedArticles, getComparisonArticles } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: home.metaTitle,
  description: home.metaDescription,
  path: "/",
});

export default function HomePage() {
  const latest = getPublishedArticles().slice(0, 6);
  const comparisons = getComparisonArticles().slice(0, 6);

  return (
    <div className="container home">
      <section className="home__hero">
        <p className="home__tagline">{home.tagline}</p>
        <h1>{home.heroHeading}</h1>
        <p className="home__intro">{home.heroIntro}</p>
        <Link href={home.heroCta.href} className="home__cta">
          {home.heroCta.label}
        </Link>
        {/* O2 ships the hero tool slot; O3 wires the first question into it. */}
        <div id="hero-tool-slot" data-slot="bolagsform-q1" />
      </section>

      <section className="home__tools">
        <h2>Verktygen</h2>
        <ul>
          {tools.map((tool) => (
            <li key={tool.id}>
              <h3>
                <Link href={tool.path}>{tool.title}</Link>
              </h3>
              <p>{tool.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="home__hubs">
        <h2>Vad vill du ha koll på?</h2>
        <ul>
          {hubs.map((hub) => (
            <li key={hub.id}>
              <h3>
                <Link href={hub.path}>{hub.h1}</Link>
              </h3>
              <p>{hub.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {latest.length ? (
        <section className="home__guides">
          <h2>Guider</h2>
          <ul>
            {latest.map((article) => (
              <li key={article.frontmatter.slug}>
                <Link href={`/${article.frontmatter.slug}/`}>
                  {article.frontmatter.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {comparisons.length ? (
        <section className="home__comparisons">
          <h2>Jämförelser</h2>
          <ul>
            {comparisons.map((article) => (
              <li key={article.frontmatter.slug}>
                <Link href={`/${article.frontmatter.slug}/`}>
                  {article.frontmatter.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="home__trust">
        <h2>Vi hänvisar till källan</h2>
        <ul>
          {home.trustRow.map((item) => (
            <li key={item.url}>
              <a href={item.url} rel="noopener" target="_blank">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
