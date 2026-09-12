# The content contract

Everything a page renders comes from `content/` through `src/lib/content/`.
Route files never read the filesystem themselves. That is what makes the shape
below enforceable: change a field and the build tells you, by file and by field,
what no longer fits.

Validation happens at **build time**. A bad frontmatter field fails
`next build` with a message like:

```
Content error in content/articles/starta-aktiebolag.mdx
  description: String must contain at most 155 character(s)
```

## What lives where

| Path | What it is | Who owns it |
|---|---|---|
| `content/articles/**/*.mdx` | every guide, comparison, list and template page | lane 2 (S4–S8) |
| `content/comparisons/<slug>.ts` | the table rows for a `type: comparison` article | S5 |
| `content/pages/*.mdx` | `/om-oss/`, `/kontakt/`, the legal pages | S8 |
| `content/lead-magnets/*.mdx` | the printable magnets behind the newsletter gate | S6 |
| `content/articles/blogg/*.mdx` | blog posts, written through `/admin/` | B1, then whoever writes |
| `content/hubs.ts` | the eight hub pages | O2, D1, B1 (`blogg`), S9 (`featured`) |
| `content/home.ts` | home page copy | O2 |
| `content/nav.ts` | header and footer navigation | O2, D1, B1 |
| `content/tools.ts` | the three tools | O3 |
| `content/affiliates.ts` | partner registry behind `/go/<id>/` | O1, then §7 enrolment |
| `content/legacy-urls.json` | WordPress paths and what happens to each | O1, Anton |
| `content/image-briefs/<phase>.json` | one entry per image slot | lane 2 |

## Article frontmatter

```yaml
title: Starta aktiebolag                 # ≤ 60 chars, no year
slug: starta-aktiebolag                  # must equal the file name
hub: starta-foretag                      # starta-foretag | ekonomi | affarside | e-handel | hemsida | marknadsforing | blogg
type: guide                              # guide | comparison | list | template | post
description: …                           # 50–155 chars
intent: "registrera ab steg för steg"    # the one search intent this page owns
updated: 2025-09-11                      # YYYY-MM-DD
sources:                                 # ≥ 1 for guide and comparison
  - label: Bolagsverket — Registrera aktiebolag
    url: https://bolagsverket.se/…
partners: [bokio, fortnox]               # ids from content/affiliates.ts
related: [enskild-firma, f-skatt]        # 2–4 slugs; filled by the link pass (S9)
faq:                                     # optional → FAQPage JSON-LD
  - q: …
    a: …
image:
  slot: starta-aktiebolag-hero           # file comes from the image pipeline
  alt: …
legacy: true                             # true = the path existed on WordPress
draft: false                             # true = hidden from hubs and sitemap
```

Rules the schema enforces, so you do not have to remember them:

- `slug` must match the file name (`_`-prefixed exemplar files are exempt).
- No two articles may share a slug.
- A year in `title` is an error — years belong in `updated` (plan §1.4).
- `guide` and `comparison` need at least one source (plan §1.1).
- The body must be at least 200 characters.
- Unknown frontmatter keys are an error, not a silent no-op.

## Comparison rows

A `type: comparison` article needs `content/comparisons/<slug>.ts` with a
default export. The columns are defined once in `src/lib/content/schema.ts`
(`COMPARISON_COLUMNS`) so every comparison table on the site is the same shape:

```ts
const comparison = {
  slug: "basta-bokforingsprogram",
  updated: "2025-09-11",
  rows: [
    {
      id: "bokio",
      name: "Bokio",
      partnerId: "bokio",          // renders the marked Annonslänk
      badge: "Bäst för start",     // optional
      verdict: "…",                // 20–400 chars, the "bäst för …" sentence
      price: "…",
      freeTier: "…",
      bestFor: "…",
      highlight: "…",
      drawback: "…",
      sourceUrl: "https://…",      // the supplier's own price page
      sourceDate: "2025-09-11",    // when we last checked it
    },
    // … at least two rows
  ],
};

export default comparison;
```

## Lead magnets

`content/lead-magnets/*.mdx` uses the page frontmatter above plus one extra
field:

```yaml
gate: newsletter    # optional — hides the body behind the newsletter form
```

They resolve at `/<slug>/` like any page, and `getLeadMagnets()` lists them.

## Components available inside MDX

Only what `src/components/Mdx.tsx` registers — anything else is a build error:

- `<Annonslank partner="bokio" />` — an inline partner link. Always routes
  through `/go/<id>/` and carries the "Annonslänk" marking when the link earns
  money (plan §1.2).
- `<PartnerCta partners={["bokio", "fortnox"]} />` — a CTA block. The article
  template already renders one from the `partners` frontmatter; use this only
  when a second block belongs mid-article.
- `<Callout title="…" variant="warning">…</Callout>` — a boxed aside. `variant`
  is optional.
- `<Checklist items={["…", "…"]} />` — a checklist. **The items render as plain
  text: markdown inside them is not parsed**, so a link has to live in the prose
  around the list, not in an item.
- `<Stat k="bolagsverket-ab-nyregistrering" label="…" />` — one figure straight
  from `src/lib/tax/constants.ts`, with its source link and, until the constant
  is verified, the "verifiera" marking. Prefer this over typing a number.
- `<StatRow items={[{ value: "…", label: "…", note: "…" }]} />` — a row of
  literal figures, for anything that is not a tax constant.
- `<Verifiera />` — marks a single number we could not check against its source.

Need another component? It is a `src/**` change, which lane 2 may not make
(plan §4.7) — write the wish into `docs/decisions-needed.md` and work around it.

## Loader API

```ts
import {
  getAllArticles,        // every article, drafts included
  getPublishedArticles,  // drafts excluded — what the site shows
  getArticleBySlug,
  getArticlesByHub,
  getComparisonArticles,
  getAllPages,
  getPageBySlug,
  getLeadMagnets,        // content/lead-magnets/*.mdx, as Page objects
  getComparison,         // async — reads content/comparisons/<slug>.ts
  getFlatEntries,        // everything reachable at /<slug>/
  getFlatEntry,
} from "@/lib/content";
```

Site furniture comes from `@/lib/content/site`: `hubs`, `nav`, `home`, `tools`,
`getHub`, `getHubByPath`, `getTool`, `RESERVED_SLUGS`.

## Routing

`/[slug]/` is one resolver that answers, in order: hub → article → page. That is
why articles can live at flat root paths (plan §1.4) without colliding with the
hub paths. `/verktyg/` and `/verktyg/[tool]/` are static segments and take
precedence; `/go/` and `/api/` sit outside the site layout.

A legacy path marked `keep` whose article does not exist yet 301s to its hub
(`src/lib/legacy-fallback.ts`). The redirect disappears on its own the moment
the article lands — no configuration change needed.
