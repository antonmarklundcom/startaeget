import { getAllArticles } from "@/lib/content";
import { HUBS, ARTICLE_TYPES } from "@/lib/content/schema";
import { hubs, tools } from "@/lib/content/site";
import { allPartners } from "@/lib/affiliates";
import type { EditorOptions } from "@/app/admin/_components/ArticleEditor";
import type { LinkTarget } from "@/app/admin/_components/LinkPicker";

/**
 * Everything the editor's selects and the link picker offer, read from the same
 * loaders the site renders from — so the admin can only pick partners that
 * exist and only link pages that resolve.
 */

export function linkPickerTargets(): LinkTarget[] {
  const targets: LinkTarget[] = [
    { href: "/", label: "Startsidan", kind: "sida" },
    { href: "/verktyg/", label: "Verktyg", kind: "hub" },
  ];
  for (const hub of hubs) targets.push({ href: hub.path, label: hub.h1, kind: "hub" });
  for (const tool of tools) targets.push({ href: tool.path, label: tool.title, kind: "verktyg" });
  for (const article of getAllArticles()) {
    if (article.frontmatter.draft) continue;
    targets.push({
      href: `/${article.frontmatter.slug}/`,
      label: article.frontmatter.title,
      kind: article.frontmatter.hub,
    });
  }
  return targets;
}

export function editorOptions(): EditorOptions {
  return {
    hubs: HUBS.map((id) => ({ id, title: hubs.find((hub) => hub.id === id)?.title ?? id })),
    types: [...ARTICLE_TYPES],
    partners: allPartners().map((partner) => ({ id: partner.id, name: partner.name })),
    articles: getAllArticles()
      .filter((article) => !article.frontmatter.draft)
      .map((article) => ({ slug: article.frontmatter.slug, title: article.frontmatter.title }))
      .sort((a, b) => a.title.localeCompare(b.title, "sv")),
    linkTargets: linkPickerTargets(),
  };
}
