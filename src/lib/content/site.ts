import { z } from "zod";
import { HUBS, type Hub } from "./schema";
import { hubs as hubData } from "../../../content/hubs";
import { nav as navData } from "../../../content/nav";
import { home as homeData } from "../../../content/home";
import { tools as toolData } from "../../../content/tools";

/**
 * Site furniture (hubs, nav, home, tools). O1 defines the shapes and validates
 * them; O2 and O3 own the data files that fill them in.
 */

/** The seven room colours (docs/design/verkstan.md §1). */
export const TINTS = ["mint", "sky", "sun", "peach", "lilac", "rose", "sand"] as const;
export type Tint = (typeof TINTS)[number];

export const hubSchema = z.object({
  id: z.string(),
  /** Path with leading and trailing slash, e.g. "/starta-foretag/". */
  path: z.string().regex(/^\/[a-z0-9-]+\/$/),
  title: z.string().min(3).max(60),
  h1: z.string().min(3).max(80),
  description: z.string().min(50).max(155),
  intro: z.string().min(40),
  /** "hub" lists its own articles; "comparisons" lists every comparison page. */
  kind: z.enum(["hub", "comparisons"]).default("hub"),
  featured: z.array(z.string()).default([]),
  /** Room colour; CSS maps it through [data-hub] in src/styles/tokens.css. */
  tint: z.enum(TINTS).default("sand"),
});

export type HubDef = z.infer<typeof hubSchema>;

export const navItemSchema = z.object({
  label: z.string().min(2).max(30),
  href: z.string().startsWith("/"),
});

export const navSchema = z.object({
  primary: z.array(navItemSchema).min(1),
  footer: z.array(
    z.object({ heading: z.string().min(2), items: z.array(navItemSchema) }),
  ),
});

export type Nav = z.infer<typeof navSchema>;

export const homeSchema = z.object({
  tagline: z.string().min(5).max(80),
  heroHeading: z.string().min(10).max(90),
  heroIntro: z.string().min(40).max(320),
  heroCta: z.object({ label: z.string(), href: z.string().startsWith("/") }),
  metaTitle: z.string().min(10).max(60),
  metaDescription: z.string().min(50).max(155),
  trustRow: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
});

export type Home = z.infer<typeof homeSchema>;

export const toolSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  path: z.string().regex(/^\/verktyg\/[a-z0-9-]+\/$/),
  title: z.string().min(3).max(60),
  short: z.string().min(3).max(40),
  description: z.string().min(50).max(155),
  intro: z.string().min(40),
  /** "stub" = the route renders a placeholder until O3 ships the tool. */
  status: z.enum(["stub", "live"]).default("stub"),
  /** Card colour, same palette as the hubs. */
  tint: z.enum(TINTS).default("sand"),
  /** Honest minutes-to-answer, shown on the tool card. */
  minutes: z.number().int().min(1).max(30).default(3),
});

export type ToolDef = z.infer<typeof toolSchema>;

function parse<S extends z.ZodTypeAny>(schema: S, value: unknown, file: string): z.infer<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    const detail = result.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n  ");
    throw new Error(`Content error in ${file}\n  ${detail}`);
  }
  return result.data;
}

export const hubs: HubDef[] = parse(z.array(hubSchema).min(1), hubData, "content/hubs.ts");
export const nav: Nav = parse(navSchema, navData, "content/nav.ts");
export const home: Home = parse(homeSchema, homeData, "content/home.ts");
export const tools: ToolDef[] = parse(z.array(toolSchema), toolData, "content/tools.ts");

export function getHub(id: string): HubDef | null {
  return hubs.find((h) => h.id === id) ?? null;
}

export function getHubByPath(slug: string): HubDef | null {
  return hubs.find((h) => h.path === `/${slug}/`) ?? null;
}

export function hubTitle(id: Hub | string): string {
  return getHub(id)?.h1 ?? id;
}

export function getTool(id: string): ToolDef | null {
  return tools.find((t) => t.id === id) ?? null;
}

/** Paths that a flat `/<slug>/` article may never take. */
export const RESERVED_SLUGS = new Set<string>([
  ...HUBS,
  ...hubs.map((h) => h.path.replaceAll("/", "")),
  "verktyg",
  "go",
  "api",
  "sitemap.xml",
  "robots.txt",
]);
