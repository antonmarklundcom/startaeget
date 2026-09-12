import matter from "gray-matter";
// Relative, not "@/": this module is imported by tests/admin.spec.ts through
// vitest, which resolves no path aliases — the same reason the content loader
// uses relative imports.
import { articleFrontmatterSchema, type ArticleFrontmatter } from "../content/schema";
import { getAllArticles, getAllPages } from "../content";
import { RESERVED_SLUGS, hubs, tools } from "../content/site";
import { duplicateHeadings } from "../../components/mdx/headings";

/**
 * The parts of the admin's validation gate that need no React: frontmatter,
 * slugs, internal links and the file serialisation. Kept apart from
 * `validate.ts` so the unit tests can import them without pulling the MDX
 * renderer (and its server-component conditions) into the test runner.
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

/**
 * Everything the gate can check without compiling the MDX: frontmatter shape,
 * body length, repeated headings and slug collisions. `validate.ts` adds the
 * compile step and the link warnings on top.
 */
export function validateShape(input: {
  frontmatter: unknown;
  body: string;
  existingSlug?: string;
  takenSlugs?: Map<string, string>;
}): ValidationResult {
  const errors: string[] = [];

  const parsed = articleFrontmatterSchema.safeParse(input.frontmatter);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${issue.path.join(".") || "(rot)"}: ${issue.message}`);
    }
    return { ok: false, errors, warnings: [] };
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

  // Slug collisions: the same checks the loader makes at build time.
  if (RESERVED_SLUGS.has(frontmatter.slug)) {
    errors.push(`Adressen /${frontmatter.slug}/ är en hub eller en reserverad route.`);
  }
  if (frontmatter.slug !== input.existingSlug) {
    const taken = input.takenSlugs ?? takenSlugsFromContent();
    const owner = taken.get(frontmatter.slug);
    if (owner) errors.push(`Adressen /${frontmatter.slug}/ används redan av ${owner}.`);
  }

  return { ok: errors.length === 0, errors, warnings: [], frontmatter };
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
