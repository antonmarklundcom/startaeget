import type { Page } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { formatUpdated } from "@/lib/site";

/** Standalone pages: om oss, kontakt, the legal pages, /redovisningsbyra/. */
export function PageTemplate({ page }: { page: Page }) {
  const fm = page.frontmatter;
  const path = `/${fm.slug}/`;
  const crumbs = [
    { name: "Start", path: "/" },
    { name: fm.title, path },
  ];

  return (
    <article className="container article" data-hub="sand">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />

      <header className="head-panel">
        <p className="chip-row">
          <span className="chip chip--source">
            Uppdaterad {fm.updated.slice(0, 7)}
            {fm.sources.length ? ` · ${fm.sources.length} källor` : ""}
          </span>
        </p>
        <h1>{fm.title}</h1>
        <p className="lede">{fm.description}</p>
      </header>

      <div className="prose" style={{ marginBlockStart: "var(--space-4)" }}>
        <Mdx source={page.body} />
      </div>

      {fm.sources.length ? (
        <section className="sources" id="kallor" aria-labelledby="page-sources-heading">
          <h2 id="page-sources-heading">Källor</h2>
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
        </section>
      ) : null}

      {fm.leadForm ? (
        <div className="related" id="byra">
          <LeadForm sourcePage={path} />
        </div>
      ) : null}
    </article>
  );
}
