/**
 * Prints, as JSON, every URL that must appear in the sitemap. Run through tsx so
 * verify.mjs can use the same loaders the site itself uses instead of
 * re-implementing them (and drifting).
 */
import { getPublishedArticles, getAllPages } from "../src/lib/content/index";
import { hubs, tools } from "../src/lib/content/site";

const urls = [
  "/",
  "/verktyg/",
  ...hubs.map((hub) => hub.path),
  ...tools.map((tool) => tool.path),
  ...getPublishedArticles().map((article) => `/${article.frontmatter.slug}/`),
  ...getAllPages()
    .filter((page) => !page.frontmatter.noindex)
    .map((page) => `/${page.frontmatter.slug}/`),
];

process.stdout.write(JSON.stringify(urls));
