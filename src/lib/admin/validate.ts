import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { mdxComponents } from "@/components/Mdx";
import { internalLinkWarnings, validateShape, type ValidationResult } from "./serialize";

/**
 * The gate every admin write goes through (plan §5.5). Frontmatter, MDX compile,
 * slug collision and internal-link resolution are checked *before* anything is
 * written to disk or committed to GitHub, so the admin cannot break the build.
 *
 * Errors block the save. Warnings do not: a link to a page a later phase will
 * add is worth saying out loud, but it is not a reason to lose the draft.
 */

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
  const shape = validateShape(input);
  if (!shape.frontmatter) return shape;

  const errors = [...shape.errors];
  const compileError = await compileMdx(input.body);
  if (compileError) errors.push(compileError);

  return {
    ok: errors.length === 0,
    errors,
    warnings: internalLinkWarnings(input.body),
    frontmatter: shape.frontmatter,
  };
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

export { internalLinkWarnings, linkTargets, takenSlugsFromContent, toFileContents } from "./serialize";
export type { ValidationResult } from "./serialize";
