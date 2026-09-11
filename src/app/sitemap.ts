import type { MetadataRoute } from "next";
import { getPublishedArticles, getAllPages } from "@/lib/content";
import { hubs, tools } from "@/lib/content/site";
import { absoluteUrl } from "@/lib/site";

/** Every indexable URL. The verify script asserts nothing is missing. */
export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().slice(0, 10);

  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: today, priority: 1 },
    { url: absoluteUrl("/verktyg/"), lastModified: today, priority: 0.9 },
  ];

  for (const hub of hubs) {
    entries.push({ url: absoluteUrl(hub.path), lastModified: today, priority: 0.8 });
  }
  for (const tool of tools) {
    entries.push({ url: absoluteUrl(tool.path), lastModified: today, priority: 0.9 });
  }
  for (const article of getPublishedArticles()) {
    entries.push({
      url: absoluteUrl(`/${article.frontmatter.slug}/`),
      lastModified: article.frontmatter.updated,
      priority: article.frontmatter.type === "comparison" ? 0.8 : 0.7,
    });
  }
  for (const page of getAllPages()) {
    if (page.frontmatter.noindex) continue;
    entries.push({
      url: absoluteUrl(`/${page.frontmatter.slug}/`),
      lastModified: page.frontmatter.updated,
      priority: 0.4,
    });
  }

  return entries;
}
