import Link from "next/link";
import type { HubDef } from "@/lib/content/site";
import type { Article } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { tools } from "@/lib/content/site";

export function HubTemplate({ hub, articles }: { hub: HubDef; articles: Article[] }) {
  const crumbs = [
    { name: "Start", path: "/" },
    { name: hub.h1, path: hub.path },
  ];

  return (
    <div className="container hub">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <h1>{hub.h1}</h1>
      <p className="hub__intro">{hub.intro}</p>

      {articles.length ? (
        <ul className="hub__grid">
          {articles.map((article) => (
            <li key={article.frontmatter.slug}>
              <h2>
                <Link href={`/${article.frontmatter.slug}/`}>
                  {article.frontmatter.title}
                </Link>
              </h2>
              <p>{article.frontmatter.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="hub__empty">
          Guiderna i den här delen publiceras löpande. Under tiden hittar du{" "}
          <Link href="/verktyg/">verktygen</Link> och{" "}
          <Link href="/jamfor/">jämförelserna</Link>.
        </p>
      )}

      <section className="hub__tools no-print">
        <h2>Räkna själv</h2>
        <ul>
          {tools.map((tool) => (
            <li key={tool.id}>
              <Link href={tool.path}>{tool.title}</Link> — {tool.short}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
