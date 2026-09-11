# Phase O2 — Design system & templates. OPUS session. Lane 1.

Read ONLY: this file, `plan.md` §1, §2, §4, §5.2, the phase table and §9, and `docs/log/O1.md`. Depends on: O1. Do not read the rest.
Execute under the autonomy protocol §4. Build nothing outside the plan.

Owns: `src/app/(site)/**` (layouts, hub routes, home, `/[slug]/` page rendering), `src/components/**`, `src/styles/**`, `content/hubs.ts`, `content/home.ts`, `content/nav.ts`, `content/articles/starta-foretag/starta-aktiebolag.mdx`, `content/articles/ekonomi/basta-bokforingsprogram.mdx`, `content/comparisons/basta-bokforingsprogram.ts`, delete `content/articles/_exemplar-*.mdx`, `docs/log/O2.md`.

Budget: one session, ≤ 90 min. When the exit criteria pass, open the PR that turn (§4.13).

Phase rules:
- Branch `phase/O2` off latest main. WIP commit every 30 min.
- Load skills: `web-design-system` (tokens → components), `nextjs-national-lead-gen` §4–5 (archetype B + patterns: big-type editorial, bento grid, split hero with tool slot; restraint baseline).
- Pick ONE accent colour and record it in the log. Two typefaces max via `next/font`. Mobile single-column flow first.
- Every template renders from the O1 loaders only. A Sonnet author must be able to produce a perfect page by writing MDX + frontmatter and nothing else — if you find yourself needing a per-page component, that is a template feature, build it once.
- Affiliate marking: every partner link renders "Annonslänk" inline; comparison tables mark sponsored rows. No ad slots, no popups, one soft newsletter CTA per page at the end.
- Write the two exemplar articles to full quality (§6 common rules, du-form, sources with dates, no year in title/H1). They are the reference Sonnet copies.
- Screenshots: one pass, ≤ 5 pages × 2 widths, after the last code change.
- Re-runnable; minor issues → `docs/log/O2.md`; stop only per §4.4.

Exit: verify green; Lighthouse mobile ≥ 90 performance / ≥ 95 SEO on `/`, `/starta-aktiebolag/`, `/basta-bokforingsprogram/`; no horizontal scroll at 375 px on those + a hub; header nav from `content/nav.ts`; footer has no placeholder text; PR merged; `docs/log/O2.md`.

## After this phase
Follow `prompts/_handoff.md`. Next: `prompts/opus-3-tools.md`, model Opus.
