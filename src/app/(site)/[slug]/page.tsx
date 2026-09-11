import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getFlatEntry,
  getFlatEntries,
  getArticlesByHub,
  getComparisonArticles,
  getComparison,
  type Article,
} from "@/lib/content";
import type { Hub } from "@/lib/content/schema";
import { hubs, getHubByPath } from "@/lib/content/site";
import { ArticleTemplate } from "@/components/templates/ArticleTemplate";
import { PageTemplate } from "@/components/templates/PageTemplate";
import { HubTemplate } from "@/components/templates/HubTemplate";
import { buildMetadata } from "@/lib/seo";

/**
 * One flat route resolves hubs, articles, comparisons and standalone pages.
 * Keeping them in a single resolver is what lets articles live at `/<slug>/`
 * (plan §1.4) without colliding with the hub paths.
 */

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [
    ...hubs.map((hub) => ({ slug: hub.path.replaceAll("/", "") })),
    ...getFlatEntries().map((entry) => ({ slug: entry.slug })),
  ];
}

function hubArticles(hubId: string): Article[] {
  const hub = hubs.find((h) => h.id === hubId);
  if (hub?.kind === "comparisons") return getComparisonArticles();
  return getArticlesByHub(hubId as Hub);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;

  const hub = getHubByPath(slug);
  if (hub) {
    return buildMetadata({ title: hub.title, description: hub.description, path: hub.path });
  }

  const entry = getFlatEntry(slug);
  if (!entry) return {};

  if (entry.kind === "article") {
    const fm = entry.article.frontmatter;
    return buildMetadata({
      title: fm.title,
      description: fm.description,
      path: `/${fm.slug}/`,
      type: "article",
      modifiedTime: fm.updated,
    });
  }

  const fm = entry.page.frontmatter;
  return buildMetadata({
    title: fm.title,
    description: fm.description,
    path: `/${fm.slug}/`,
    noindex: fm.noindex,
  });
}

export default async function FlatPage({ params }: Params) {
  const { slug } = await params;

  const hub = getHubByPath(slug);
  if (hub) {
    return <HubTemplate hub={hub} articles={hubArticles(hub.id)} />;
  }

  const entry = getFlatEntry(slug);
  if (!entry) notFound();

  if (entry.kind === "page") {
    return <PageTemplate page={entry.page} />;
  }

  const comparison =
    entry.article.frontmatter.type === "comparison" ? await getComparison(slug) : null;

  return <ArticleTemplate article={entry.article} comparison={comparison} />;
}
