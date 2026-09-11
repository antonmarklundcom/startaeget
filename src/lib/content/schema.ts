import { z } from "zod";

/**
 * The content contract (plan §2.2). Every MDX file in `content/` is validated
 * against this at build time; a failing file fails the build with the file path
 * and the offending field in the message.
 *
 * Lane 2 phases write MDX and TypeScript content files only — never this file.
 */

export const HUBS = [
  "starta-foretag",
  "ekonomi",
  "affarside",
  "e-handel",
  "hemsida",
  "marknadsforing",
] as const;

export type Hub = (typeof HUBS)[number];

export const ARTICLE_TYPES = ["guide", "comparison", "list", "template"] as const;
export type ArticleType = (typeof ARTICLE_TYPES)[number];

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * YAML parses an unquoted `2025-09-11` into a Date, so normalise back to the
 * ISO day string before validating. Keeps frontmatter authorable either way.
 */
const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be a date on the form YYYY-MM-DD"),
);

const sourceSchema = z.object({
  label: z.string().min(2).max(120),
  url: z.string().url(),
});

const faqSchema = z.object({
  q: z.string().min(5).max(200),
  a: z.string().min(10).max(1200),
});

const imageSchema = z.object({
  slot: z
    .string()
    .regex(slugPattern, "image.slot must be a lowercase kebab-case slot name"),
  alt: z.string().min(5).max(180),
});

export const articleFrontmatterSchema = z
  .object({
    title: z.string().min(5).max(60),
    slug: z.string().regex(slugPattern, "slug must be flat, lowercase kebab-case"),
    hub: z.enum(HUBS),
    type: z.enum(ARTICLE_TYPES),
    description: z.string().min(50).max(155),
    intent: z.string().min(5).max(160),
    updated: isoDate,
    sources: z.array(sourceSchema).default([]),
    partners: z.array(z.string().regex(slugPattern)).default([]),
    related: z.array(z.string().regex(slugPattern)).default([]),
    faq: z.array(faqSchema).default([]),
    image: imageSchema.optional(),
    legacy: z.boolean().default(false),
    /** Hidden from hub grids and the sitemap; used for the O1 exemplars. */
    draft: z.boolean().default(false),
  })
  .strict()
  .superRefine((value, ctx) => {
    if ((value.type === "guide" || value.type === "comparison") && value.sources.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sources"],
        message: `${value.type} pages need at least one authority source (plan §1.1)`,
      });
    }
    if (/\b(19|20)\d{2}\b/.test(value.title)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["title"],
        message: "no year in the title — years belong in `updated` (plan §1.4)",
      });
    }
  });

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

/** Standalone pages (`/om-oss/`, `/kontakt/`, the legal pages). */
export const pageFrontmatterSchema = z
  .object({
    title: z.string().min(3).max(60),
    slug: z.string().regex(slugPattern),
    description: z.string().min(50).max(155),
    updated: isoDate,
    sources: z.array(sourceSchema).default([]),
    noindex: z.boolean().default(false),
    /** Renders the byrå lead form at the bottom of the page. */
    leadForm: z.boolean().default(false),
  })
  .strict();

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;

/**
 * Comparison columns are defined once, here, so every comparison table on the
 * site has the same shape and the sticky table component never branches.
 */
export const COMPARISON_COLUMNS = [
  { key: "price", label: "Pris" },
  { key: "freeTier", label: "Gratisnivå" },
  { key: "bestFor", label: "Bäst för" },
  { key: "highlight", label: "Styrka" },
  { key: "drawback", label: "Svaghet" },
] as const;

export type ComparisonColumnKey = (typeof COMPARISON_COLUMNS)[number]["key"];

const comparisonRowSchema = z
  .object({
    id: z.string().regex(slugPattern),
    name: z.string().min(2).max(60),
    /** Partner id from content/affiliates.ts — renders the Annonslänk CTA. */
    partnerId: z.string().regex(slugPattern).optional(),
    badge: z.string().max(40).optional(),
    verdict: z.string().min(20).max(400),
    price: z.string().min(1).max(80),
    freeTier: z.string().min(1).max(80),
    bestFor: z.string().min(3).max(80),
    highlight: z.string().min(3).max(160),
    drawback: z.string().min(3).max(160),
    sourceUrl: z.string().url().optional(),
    sourceDate: isoDate.optional(),
  })
  .strict();

export const comparisonSchema = z
  .object({
    slug: z.string().regex(slugPattern),
    updated: isoDate,
    rows: z.array(comparisonRowSchema).min(2),
  })
  .strict();

export type ComparisonRow = z.infer<typeof comparisonRowSchema>;
export type Comparison = z.infer<typeof comparisonSchema>;
