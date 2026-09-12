import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { articleFrontmatterSchema, type ArticleFrontmatter } from "@/lib/content/schema";
import { getAllArticles, getAllPages } from "@/lib/content";
import { RESERVED_SLUGS, hubs, tools } from "@/lib/content/site";
import { duplicateHeadings } from "@/components/mdx/headings";
import { mdxComponents } from "@/components/Mdx";

/**
 * The gate every admin write goes through (plan §5.5). Frontmatter, MDX compile,
 * slug collision and internal-link resolution are checked *before* anything is
 * written to disk or committed to GitHub, so the admin cannot break the build.
 *
 * Errors block the save. Warnings do not: a link to a page a later phase will
 * add is worth saying out loud, but it is not a reason to lose the draft.
 */

export type ValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  frontmatter?: ArticleFrontmatter;
};

/** Everything a `](/x/)` link may point at. */
export function linkTargets(): Set<string> {
  const targets = new Set<string>(["/"]);
  for (const hub of hubs) targets.add(hub.path);
  for (const tool of tools) targets.add(tool.path);
  targets.add("/verktyg/");
  for (const article of getAllArticles()) targets.add(`/${article.frontmatter.slug}/`);
  for (const page of getAllPages()) targets.add(`/${page.frontmatter.slug}/`);
  return targets;
}

export function internalLinkWarnings(body: string): string[] {
  const targets = linkTargets();
  const warnings: string[] = [];
  for (const match of body.matchAll(/]\((\/[^)\s"']*)\)/g)) {
    const href = match[1].split("#")[0].split("?")[0];
    if (!href || href.startsWith("/go/") || href.startsWith("/api/")) continue;
    const normalised = href.endsWith("/") ? href : `${href}/`;
    if (!targets.has(normalised) && !warnings.includes(normalised)) {
      warnings.push(normalised);
    }
  }
  return warnings.map(
    (href) => `Länken ${href} pekar inte på någon sida som finns än — kontrollera adressen.`,
  );
}

/** Every slug the repo on disk claims, mapped to the file that claims it. */
export function takenSlugsFromContent(): Map<string, string> {
  const taken = new Map<string, string>();
  for (const article of getAllArticles()) taken.set(article.frontmatter.slug, article.file);
  for (const page of getAllPages()) taken.set(page.frontmatter.slug, page.file);
  return taken;
}

export async function validateArticle(input: {
  frontmatter: unknown;
  body: string;
  /** The slug this file already has on disk; it may keep its own slug. */
  existingSlug?: string;
  /**
   * Slugs that already exist, from the store rather than the loader: in github
   * mode the truth is the branch, and the loader's cache is the deployed build.
   */
  takenSlugs?: Map<string, string>;
}): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const parsed = articleFrontmatterSchema.safeParse(input.frontmatter);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${issue.path.join(".") || "(rot)"}: ${issue.message}`);
    }
    return { ok: false, errors, warnings };
  }
  const frontmatter = parsed.data;

  if (input.body.trim().length < 200) {
    errors.push("Texten är kortare än 200 tecken — loadern avvisar den vid bygget.");
  }

  const repeated = duplicateHeadings(input.body);
  if (repeated.length) {
    errors.push(
      `Två rubriker med samma text (${repeated.map((h) => `"${h}"`).join(", ")}) — ` +
        "innehållsförteckningen kan bara länka den första.",
    );
  }

  // Slug collisions: the same three checks the loader makes at build time.
  if (RESERVED_SLUGS.has(frontmatter.slug)) {
    errors.push(`Adressen /${frontmatter.slug}/ är en hub eller en reserverad route.`);
  }
  if (frontmatter.slug !== input.existingSlug) {
    const taken = input.takenSlugs ?? takenSlugsFromContent();
    const owner = taken.get(frontmatter.slug);
    if (owner) errors.push(`Adressen /${frontmatter.slug}/ används redan av ${owner}.`);
  }

  const compiled = await compileMdx(input.body);
  if (compiled) errors.push(compiled);

  warnings.push(...internalLinkWarnings(input.body));

  return { ok: errors.length === 0, errors, warnings, frontmatter };
}

/** Compiles the body through the site's own MDX pipeline. Returns the error, or null. */
export async function compileMdx(body: string): Promise<string | null> {
  try {
    await compileMDX({
      source: body,
      components: mdxComponents,
      options: { mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } },
    });
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

/**
 * Frontmatter → file. `gray-matter` writes the YAML, so what the admin saves
 * parses back to exactly what it saved (asserted in tests/admin.spec.ts).
 */
export function toFileContents(frontmatter: ArticleFrontmatter, body: string): string {
  const ordered: Record<string, unknown> = {
    title: frontmatter.title,
    slug: frontmatter.slug,
    hub: frontmatter.hub,
    type: frontmatter.type,
    description: frontmatter.description,
    intent: frontmatter.intent,
    updated: frontmatter.updated,
    sources: frontmatter.sources,
    partners: frontmatter.partners,
    related: frontmatter.related,
  };
  if (frontmatter.faq.length) ordered.faq = frontmatter.faq;
  if (frontmatter.image) ordered.image = frontmatter.image;
  ordered.legacy = frontmatter.legacy;
  if (frontmatter.draft) ordered.draft = true;

  const trimmed = `${body.trim()}\n`;
  return matter.stringify(trimmed, ordered);
}
