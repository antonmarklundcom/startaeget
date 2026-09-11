import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { RESERVED_SLUGS } from "./site";
// Relative, not "@/": next.config.ts pulls this loader in through
// legacy-fallback.ts, and that compile step does not see the path aliases.
import { duplicateHeadings } from "../../components/mdx/headings";
import {
  articleFrontmatterSchema,
  pageFrontmatterSchema,
  comparisonSchema,
  type ArticleFrontmatter,
  type PageFrontmatter,
  type Comparison,
  type Hub,
} from "./schema";

/**
 * The one way pages get content. Route files import from here and nothing else
 * reads `content/` directly — that is what keeps the contract enforceable.
 *
 * Everything is read once per process and cached: content is files on disk that
 * never change while the server runs.
 */

export const CONTENT_ROOT = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_ROOT, "articles");
const PAGES_DIR = path.join(CONTENT_ROOT, "pages");
const COMPARISONS_DIR = path.join(CONTENT_ROOT, "comparisons");

export type Article = {
  frontmatter: ArticleFrontmatter;
  body: string;
  /** Path relative to the repository root, for build error messages. */
  file: string;
};

export type Page = {
  frontmatter: PageFrontmatter;
  body: string;
  file: string;
};

class ContentError extends Error {
  constructor(file: string, detail: string) {
    super(`Content error in ${file}\n  ${detail}`);
    this.name = "ContentError";
  }
}

function walk(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, ext));
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out.sort();
}

function relative(file: string): string {
  return path.relative(process.cwd(), file).split(path.sep).join("/");
}

function formatIssues(error: unknown): string {
  if (typeof error === "object" && error && "issues" in error) {
    const issues = (error as { issues: { path: (string | number)[]; message: string }[] }).issues;
    return issues
      .map((i) => `${i.path.length ? i.path.join(".") : "(root)"}: ${i.message}`)
      .join("\n  ");
  }
  return String(error);
}

let articleCache: Article[] | null = null;

export function getAllArticles(): Article[] {
  if (articleCache) return articleCache;

  const articles: Article[] = [];
  for (const file of walk(ARTICLES_DIR, ".mdx")) {
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const parsed = articleFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new ContentError(relative(file), formatIssues(parsed.error));
    }
    const expected = path.basename(file, ".mdx");
    if (!expected.startsWith("_") && expected !== parsed.data.slug) {
      throw new ContentError(
        relative(file),
        `slug "${parsed.data.slug}" does not match the file name "${expected}.mdx"`,
      );
    }
    if (content.trim().length < 200) {
      throw new ContentError(relative(file), "body is empty or shorter than 200 characters");
    }
    // Two `## ` headings with the same text render the same id, so the table of
    // contents links the first one twice and the page ships a duplicate id.
    const repeated = duplicateHeadings(content);
    if (repeated.length) {
      throw new ContentError(
        relative(file),
        `repeated "## " heading: ${repeated.map((h) => `"${h}"`).join(", ")} — ` +
          "give each heading its own wording so the table of contents can link it",
      );
    }
    articles.push({ frontmatter: parsed.data, body: content, file: relative(file) });
  }

  const seen = new Map<string, string>();
  for (const article of articles) {
    const slug = article.frontmatter.slug;
    const previous = seen.get(slug);
    if (previous) {
      throw new ContentError(article.file, `duplicate slug, already used by ${previous}`);
    }
    // A slug that collides with a hub or a reserved route would be silently
    // shadowed by the /[slug]/ resolver, so it is an error, not a surprise.
    if (RESERVED_SLUGS.has(slug)) {
      throw new ContentError(article.file, `slug "${slug}" is a hub or reserved route`);
    }
    seen.set(slug, article.file);
  }

  articleCache = articles;
  return articles;
}

/** Articles that are part of the public site (drafts excluded). */
export function getPublishedArticles(): Article[] {
  return getAllArticles().filter((a) => !a.frontmatter.draft);
}

export function getArticleBySlug(slug: string): Article | null {
  return getAllArticles().find((a) => a.frontmatter.slug === slug) ?? null;
}

export function getArticlesByHub(hub: Hub): Article[] {
  return getPublishedArticles()
    .filter((a) => a.frontmatter.hub === hub)
    .sort((a, b) => b.frontmatter.updated.localeCompare(a.frontmatter.updated));
}

export function getComparisonArticles(): Article[] {
  return getPublishedArticles().filter((a) => a.frontmatter.type === "comparison");
}

let pageCache: Page[] | null = null;

export function getAllPages(): Page[] {
  if (pageCache) return pageCache;

  const pages: Page[] = [];
  for (const file of walk(PAGES_DIR, ".mdx")) {
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const parsed = pageFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new ContentError(relative(file), formatIssues(parsed.error));
    }
    const expected = path.basename(file, ".mdx");
    if (expected !== parsed.data.slug) {
      throw new ContentError(
        relative(file),
        `slug "${parsed.data.slug}" does not match the file name "${expected}.mdx"`,
      );
    }
    if (RESERVED_SLUGS.has(parsed.data.slug)) {
      throw new ContentError(
        relative(file),
        `slug "${parsed.data.slug}" is a hub or reserved route`,
      );
    }
    const repeated = duplicateHeadings(content);
    if (repeated.length) {
      throw new ContentError(
        relative(file),
        `repeated "## " heading: ${repeated.map((h) => `"${h}"`).join(", ")} — ` +
          "two headings with the same wording render the same id",
      );
    }
    pages.push({ frontmatter: parsed.data, body: content, file: relative(file) });
  }

  const claimed = new Map<string, string>();
  for (const article of getAllArticles()) {
    claimed.set(article.frontmatter.slug, article.file);
  }
  for (const page of pages) {
    const owner = claimed.get(page.frontmatter.slug);
    if (owner) {
      throw new ContentError(page.file, `slug already used by the article in ${owner}`);
    }
  }

  pageCache = pages;
  return pages;
}

export function getPageBySlug(slug: string): Page | null {
  return getAllPages().find((p) => p.frontmatter.slug === slug) ?? null;
}

export function listComparisonSlugs(): string[] {
  return walk(COMPARISONS_DIR, ".ts").map((f) => path.basename(f, ".ts"));
}

/**
 * Comparison rows live next to the article as a typed TS file so lane 2 can edit
 * a table without touching a component. Validated on read, like frontmatter.
 */
export async function getComparison(slug: string): Promise<Comparison | null> {
  if (!listComparisonSlugs().includes(slug)) return null;
  const mod = (await import(`../../../content/comparisons/${slug}.ts`)) as {
    default?: unknown;
  };
  const parsed = comparisonSchema.safeParse(mod.default);
  if (!parsed.success) {
    throw new ContentError(`content/comparisons/${slug}.ts`, formatIssues(parsed.error));
  }
  if (parsed.data.slug !== slug) {
    throw new ContentError(
      `content/comparisons/${slug}.ts`,
      `slug "${parsed.data.slug}" does not match the file name`,
    );
  }
  return parsed.data;
}

export type ContentEntry =
  | { kind: "article"; slug: string; article: Article }
  | { kind: "page"; slug: string; page: Page };

/** Everything reachable at a flat `/<slug>/` path. */
export function getFlatEntries(): ContentEntry[] {
  const entries: ContentEntry[] = getPublishedArticles().map((article) => ({
    kind: "article" as const,
    slug: article.frontmatter.slug,
    article,
  }));
  for (const page of getAllPages()) {
    entries.push({ kind: "page" as const, slug: page.frontmatter.slug, page });
  }
  return entries;
}

export function getFlatEntry(slug: string): ContentEntry | null {
  return getFlatEntries().find((e) => e.slug === slug) ?? null;
}

export * from "./schema";
