import type { Page } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { formatUpdated } from "@/lib/site";

export function PageTemplate({ page }: { page: Page }) {
  const fm = page.frontmatter;
  const crumbs = [
    { name: "Start", path: "/" },
    { name: fm.title, path: `/${fm.slug}/` },
  ];

  return (
    <article className="container page">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <h1>{fm.title}</h1>
      <p className="article__updated">Uppdaterad {formatUpdated(fm.updated)}</p>
      <div className="prose">
        <Mdx source={page.body} />
      </div>
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
    </article>
  );
}
