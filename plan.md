# startaegetforetag.se — relaunch plan

Sweden only. Swedish language (du-form). Founder-first content + decision tools hub, built as a custom Next.js app on the Hostinger Node.js + MySQL/Drizzle stack. Old WordPress: 48 posts, nothing carried over except ~40 evergreen URL paths.

## Phase table

| Phase | Lane | Model | Prompt | Plan §§ | Owns | Depends on |
|---|---|---|---|---|---|---|
| O1 Foundation | 1 | Opus | `prompts/opus-1-foundation.md` | §5.1 | everything under `src/`, `drizzle/`, `scripts/`, `tests/`, `.github/`, config files, `content/legacy-urls.json`, `content/affiliates.ts` | — |
| O2 Design & templates | 1 | Opus | `prompts/opus-2-design-templates.md` | §5.2 | `src/app/(site)/**` layouts, `src/components/**`, `src/styles/**`, `content/hubs.ts`, `content/home.ts`, `content/articles/_exemplar-*.mdx` | O1 |
| O3 Tools | 1 | Opus | `prompts/opus-3-tools.md` | §5.3 | `src/app/(site)/verktyg/**`, `src/components/tools/**`, `src/lib/tax/**`, `content/tools.ts`, `tests/tools.spec.ts` | O1, O2 |
| S4 Starta företag | 2 | Sonnet | `prompts/sonnet-4-starta-foretag.md` | §6.1 | `content/articles/starta-foretag/**`, `content/image-briefs/s4.json` | O2, O3 |
| S5 Ekonomi & jämförelser | 2 | Sonnet | `prompts/sonnet-5-ekonomi-jamfor.md` | §6.2 | `content/articles/ekonomi/**`, `content/comparisons/**`, `content/image-briefs/s5.json` | O2, O3 |
| S6 Affärsidé & affärsplan | 2 | Sonnet | `prompts/sonnet-6-affarside.md` | §6.3 | `content/articles/affarside/**`, `content/lead-magnets/**`, `content/image-briefs/s6.json` | O2 |
| S7 E-handel & hemsida | 2 | Sonnet | `prompts/sonnet-7-ehandel-hemsida.md` | §6.4 | `content/articles/e-handel/**`, `content/articles/hemsida/**`, `content/image-briefs/s7.json` | O2 |
| S8 Marknadsföring & sidor | 2 | Sonnet | `prompts/sonnet-8-marknadsforing-sidor.md` | §6.5 | `content/articles/marknadsforing/**`, `content/pages/**`, `content/image-briefs/s8.json` | O2 |
| S9 Link pass | — | Sonnet | `prompts/sonnet-9-link-pass.md` | §6.6 | any `content/**` file (links/related only), `content/nav.ts`, `KNOWN-ISSUES.md`, `plan.md` §9 | all |

Estimated cost: O1 $15–20, O2 $12–18, O3 $15–20, S4–S8 $8–12 each in parallel, S9 ~$4 → roughly $95–120. Wall-clock ≈ 5 h (lane 1 ≈ 3 h, lane 2 ≈ 1.5 h, link pass ≈ 0.5 h). Imagery is a manual pipeline after the build (§7), not a phase.

---

## 1. Decisions already made — do not re-litigate

These are the founder-level recommendations from the planning session. Anton confirms or corrects them by editing this section before merging the plan PR; once merged they are locked.

### 1.1 Positioning
- **Who:** the first-time founder in Sweden, 25–45, employed today, about to register a company (often a side business first). Not established SMEs, not accountants, not investors.
- **Job to be done:** "I've decided to start. Tell me what to *choose* and what it will *cost me*." Verksamt/Skatteverket/Bolagsverket explain the rules and never take a side. Every other "starta eget" site rewrites those rules. We take a side, with numbers.
- **Promise (tagline direction):** *Rätt val från första dagen.* Decision tools + honest comparisons + plain-Swedish guides that cite the authority pages instead of paraphrasing them.
- **Voice:** du-form, concrete, numbers with sources and dates, no bureaucratese, no anglicisms in headings, compound words closed. Every fact that changes yearly carries a "Uppdaterad YYYY-MM" line and a source link.
- **Authority mechanic:** every guide links out to the exact Skatteverket/Bolagsverket/Verksamt page it relies on. Linking to the authority is the trust signal; competing sites hide it.

### 1.2 Business model (in priority order)
1. **Affiliate** — the primary engine. Partner slots by cluster: bokföringsprogram (Bokio, Fortnox, Visma eEkonomi, Wint, Björn Lundén), företagsbank/företagskonto (the digital challengers and the big four where programs exist), webbhotell + domän (Loopia, One.com, Hostinger, Miss Hosting), företagsförsäkring, kassasystem/e-handelsplattform (Shopify, Wikinggruppen, Quickbutik), lagerbolag/bolagsbildning services. Programs are enrolled via Adtraction/Adrecord/Tradedoubler or direct — enrolment is §7 work; the site ships with a partner registry where every slot has a fallback (plain non-affiliate link) so nothing blocks.
2. **Lead-gen to redovisningsbyråer** — "Få offert från en redovisningsbyrå" form on every ekonomi/bokföring page and as the Bolagsformsväljaren exit. Leads land in VenderCRM; sold or partnered later. Ships day one because the form is cheap and the leads accrue.
3. **Newsletter + lead magnets** (affärsplan-mall, startkostnads-checklista, "första 30 dagarna" checklist) — builds the list that makes 1 and 2 repeatable.
4. **Display ads** — not before the site has traffic. Layout reserves no ad slots at launch (the old ad slot is one of the things that made it look unfinished).
5. **Paid products** — backlog (§10). No paywall at launch.

All affiliate links are marked "Annonslänk" inline and explained on `/annonspolicy/` — required under Swedish marketing law and a trust asset.

### 1.3 Stack
- **Custom Next.js (App Router, TypeScript, Tailwind) on a Hostinger Node.js slot with Hostinger MySQL + Drizzle.** Not WordPress. Reasons: the three interactive tools are the product and need real components; `/go/<partner>` click logging, lead forms and newsletter need a server; it is Anton's proven stack (`nodejs-mysql-hostinger-stack`, `nextjs-deploy-hostinger`); WordPress would recreate the same unfinished-theme problem and adds a CMS nobody edits.
- **Content lives in the repo**, not the DB: MDX article files + typed TypeScript content arrays. No CMS. Sonnet phases write files, PRs review them, Git is the history.
- **DB is small on purpose:** `leads`, `subscribers`, `affiliate_clicks`, `tool_results` (only when the user asks to e-mail a result). Nothing public renders from the DB.
- Static generation for every content page (`generateStaticParams`); route handlers only for `/go/*`, forms and the sitemap.

### 1.4 URLs
- Keep every dateless legacy slug at its **flat root path** (`/starta-aktiebolag/`) — they carry the existing rankings. Hubs get new top-level paths (§2). Articles are addressed by slug only; the hub is metadata, not part of the path. Trailing slash on, matching WordPress.
- Three dated URLs get 301s (§7 map). Any legacy post we do not rewrite 301s to its hub, never 404s.
- New articles use dateless slugs. Years go in the "Uppdaterad" line, never in the path or H1.

### 1.5 Tools (3, all Opus-built, all monetized)
1. **Bolagsformsväljaren** — aktiebolag vs enskild firma (vs handelsbolag as an edge) from 6–8 questions; result page with reasoning, next steps, and the partner CTAs that fit the answer.
2. **Startkostnadskalkylatorn** — itemised cost to start (Bolagsverket fees, aktiekapital, bank, bokföringsprogram, försäkring, webbhotell/domän, redovisningsbyrå, …); every line item is a partner slot.
3. **Vad-blir-kvar-kalkylatorn** — from expected revenue and costs to what lands in your pocket, enskild firma vs aktiebolag (egenavgifter vs lön + arbetsgivaravgifter + utdelning), simplified and clearly labelled as an estimate.

Not built now (backlog): affärsplan-generator (lead magnet PDF instead), company-name/domain checker (no free Bolagsverket API; domain lookup rate limits), moms-only calculator (folded into tool 3).

### 1.6 Imagery and copy
- Nothing from the old site is reused: no images, no copy. Placeholder image slots ship in the build; real images come after the build via the manual Higgsfield → webimg pipeline (§7).
- Every article is written fresh by the Sonnet phases against the brief in its cluster section.

### 1.7 Cutover
- Build and verify on the Hostinger preview URL. DNS/domain mapping switch is the last §7 step, done by Anton after the link pass. WordPress is exported (URL list) before it is switched off, then archived, not deleted, for 90 days.

---

## 2. Content model (the contract — written in O1, never retrofitted)

### 2.1 Information architecture

```
/                                   home: hero with embedded tool entry, hubs, featured guides, newsletter
/starta-foretag/                    hub: bolagsformer, registrering, F-skatt, moms, bidrag, lån, försäkring
/ekonomi/                           hub: bank, bokföring, bokföringsprogram, lön/utdelning, skatt
/affarside/                         hub: affärsidéer, affärsplan, mallar, validering
/e-handel/                          hub: e-handel, dropshipping, webshop-plattformar
/hemsida/                           hub: webbhotell, domän, WordPress, skapa hemsida
/marknadsforing/                    hub: SEO, Google Ads, sociala medier, byråmodeller
/jamfor/                            hub for comparison pages (the money pages)
/verktyg/                           hub for the three tools
/verktyg/bolagsform/                tool 1
/verktyg/startkostnad/              tool 2
/verktyg/vad-blir-kvar/             tool 3
/<slug>/                            every article and comparison page, flat, dateless
/go/<partner>/                      affiliate redirect + click log (noindex, robots disallow)
/nyhetsbrev/  /om-oss/  /kontakt/  /annonspolicy/  /integritetspolicy/  /villkor/
/redovisningsbyra/                  lead-gen landing: "få offert" form
```

Old WordPress category URLs (`/category/...`) 301 to the matching hub. `/starta-foretag-101/`, `/tips-rad/`, `/inspiration/` and the platform categories fold into the hubs above; `/wordpress/`, `/facebook/`, `/instagram/`, `/google-ads/` category paths 301 to `/hemsida/` and `/marknadsforing/`.

### 2.2 Article frontmatter (MDX) — the key shape

```yaml
title: string                 # ≤ 60 chars, no year
slug: string                  # flat, dateless, matches legacy slug when one exists
hub: starta-foretag | ekonomi | affarside | e-handel | hemsida | marknadsforing
type: guide | comparison | list | template
description: string           # ≤ 155 chars
intent: string                # the one search intent this page owns (cannibalisation guard)
updated: YYYY-MM-DD
sources: [{ label, url }]     # authority links; at least one for guide/comparison
partners: [partnerId]         # slots from content/affiliates.ts rendered by the template
related: [slug]               # filled by the link pass, empty in lane 2
faq: [{ q, a }]               # optional → FAQPage JSON-LD
image: { slot: string, alt: string }   # slot name only; file supplied by the image pipeline
legacy: true | false          # true = path existed on the WordPress site
```

Page files are three lines: import the content loader, `generateStaticParams`, render `<ArticleTemplate>`. Comparisons add a `rows` table (`content/comparisons/<slug>.ts`) with columns defined once in O1.

### 2.3 Other content files
- `content/affiliates.ts` — partner registry: `{ id, name, category, url, affiliateUrl?, disclosure, cta, fallback }`. `affiliateUrl` empty until §7 enrolment; `/go/<id>` uses it when present, `url` otherwise.
- `content/hubs.ts`, `content/home.ts`, `content/nav.ts`, `content/tools.ts`, `content/pages/*.mdx`.
- `content/legacy-urls.json` — all 48 WordPress paths with `{ path, action: keep | redirect | retire, to? }`. O1 generates `next.config` redirects from it and the verify script asserts every entry answers 200 or 301.
- `content/image-briefs/<phase>.json` — `{ slot, prompt, alt, page }` per image, consumed by the manual image pipeline.

### 2.4 Database (Drizzle, MySQL)
`leads(id, type: byra | kontakt, name, email, phone?, company_form?, message, source_page, created_at, forwarded_at?)`, `subscribers(id, email, source, magnet?, confirmed_at?, created_at)`, `affiliate_clicks(id, partner_id, source_page, created_at)`, `tool_results(id, tool, email, payload_json, created_at)`. Leads also POST to VenderCRM per `vendercrm-lead-capture`; the DB row is the fallback and the log.

## 3. Feature scope

**Core (launch):** IA + all hubs; every legacy evergreen article rewritten; ~20 new articles (§6); 6 comparison pages; 3 tools; `/go/` tracking; byrå lead form; newsletter + 3 lead magnets; legal pages; SEO plumbing (metadata, sitemap, robots, JSON-LD Organization/Article/FAQPage/BreadcrumbList/SoftwareApplication for tools); redirects; CI with build + verify + screenshots.

**Approved extras:** e-mail-my-result on tools (captures subscribers); "Uppdaterad" freshness lines; print-friendly checklist pages.

**Backlog (§10):** ads, paid products, affärsplan-generator, name/domain checker, comments, user accounts.

## 4. Autonomy protocol

Every build session runs under these rules. They are copied from `phased-autonomous-build` and are not negotiable inside a phase.

1. Work until the phase's exit criteria all pass; never ask permission for in-plan work.
2. One PR per phase: branch `phase/<id>` off latest `main`; create, watch and merge the PR when green. A red build is always the session's own work. Lane 2 phases never wait for each other — only for lane 1.
3. Minor non-blocking issues → the phase's `docs/log/<phase>.md` "Known issues"; keep building. Only still-open, cross-phase items are promoted to root `KNOWN-ISSUES.md` by the link pass.
4. Stop and ask ONLY for: a missing credential with no graceful fallback, or a bad-foundation decision (content shape, route contract, tax math, DB schema) where guessing wrong forces a rewrite. "Ask" = append to `docs/decisions-needed.md`, commit, push, end the session. Never wait in-session for an answer.
5. Missing env/config never blocks: document in `.env.example`, degrade gracefully (log to DB only, plain link instead of affiliate link, placeholder image).
6. Every prompt is re-runnable: check what exists on the branch, continue from the first unmet exit criterion. WIP commit at least every 30 minutes.
7. Lane 2 hard limits: no changes to `src/**`, schema, templates, routing, tokens or tax constants. Workaround + Backlog note instead.
8. **Model guardrail:** Fable/Mythos-class is never used for any phase, subagent, spawned session, watcher or Routine. Phase table names only Opus and Sonnet. If a session believes Fable is needed, it writes why to `docs/decisions-needed.md` and ends.
9. **File ownership:** a phase writes only inside its `Owns` block plus its own `docs/log/<phase>.md`, a new `/* == <phase> == */` block appended to `src/styles/phase.css` (lane 2 only, and only if unavoidable), and one line in `docs/decisions-needed.md` for a cross-cutting wish. On `git merge main` conflicts: main wins, re-apply own change, re-run verify. Never resolve a conflict by editing a file outside Owns.
10. **Handoff:** a phase is done when PR merged green + exit checklist passed + one pre-handoff audit (one verify run on main, one adversarial re-read of the merged diff, findings fixed in one follow-up commit) + phase log committed. Lane 1 phases spawn the next lane 1 phase via `create_session` (inherit environment and permission mode, never `plan`, `model` set explicitly from the phase table, prompt exactly `Read prompts/<next-file>.md in this repo and execute it.`). The last lane 1 phase (O3) creates the watcher Routine, then spawns lane 2 phases up to 4 at once. Lane 2 phases spawn nothing. The link pass is spawned by the watcher when every lane 2 PR is merged and deletes the watcher before its closing report. Fallback without `create_session`: continue in the same window if the model matches, otherwise stop and report.
11. **Phase log** `docs/log/<phase>.md`: ≤ 12 lines "Built", ≤ 8 "Decisions", ≤ 8 "Known issues", one line "Verification: verify green on <commit>, screenshots in PR CI artifact". Add the index line to §9.
12. **Orientation read:** prompt file, plan §1 and §4, own section(s), phase table, §9, and the logs of the phases in `Depends on`. Nothing else.
13. **Polish cap:** one screenshot pass (≤ 5 pages × 2 widths, after the last code change), one Lighthouse run only if the exit criteria name a number, one scripted interaction pass only for phases shipping JS (script saved under `tests/`). PR body written once, ≤ 25 lines. When the exit criteria pass, open the PR that turn. Ideas found afterwards go to §10.
14. **Screenshots live in CI, not git.** `docs/screenshots/` is git-ignored; the CI job uploads them as a PR artifact.
15. **Decisions travel by files, never by messages.** To change a running phase, edit its prompt on main; phases re-read their prompt before opening and before merging the PR.
16. **Anti-fabrication:** every tax rate, fee, threshold or price lives in `src/lib/tax/constants.ts` or the article's `sources` with a source URL and validity date. If a session cannot verify a number against Skatteverket/Bolagsverket/Verksamt (or the partner's own page), it writes "verifiera" next to it and logs it under Known issues instead of guessing.

## 5. Lane 1 — foundation (Opus, sequential)

### 5.1 O1 Foundation
Scaffold and contracts. No visual design beyond tokens; no article copy.
- `create-next-app` (App Router, TS, Tailwind, `src/`), Drizzle + mysql2 + drizzle-kit + tsx per `nodejs-mysql-hostinger-stack` §1; `.env.example` with every var (DATABASE_URL, VENDERCRM_*, RESEND_API_KEY, SITE_URL, ...).
- Content loader (`src/lib/content/`): reads MDX by slug, validates frontmatter (§2.2) with zod at build time; a failing article fails the build with a readable message. Comparison rows loader. Hub/nav/home/tools loaders.
- Routing: `/[slug]/` catch-all for articles + comparisons + `content/pages`; hub routes; `/verktyg/` stub routes (O3 fills); `/go/[partner]/` route handler (log click → 302; `noindex`, `robots.ts` disallow `/go/`); form route handlers (`/api/lead`, `/api/subscribe`, `/api/tool-result`) with zod validation, honeypot, rate limit, VenderCRM forward per `vendercrm-lead-capture`, DB insert fallback.
- `content/legacy-urls.json`: seeded from §7; O1 attempts to fetch `https://startaegetforetag.se/wp-sitemap-posts-post-1.xml` to complete it, and if the sandbox blocks the host, marks the file `"complete": false` and logs a §7 reminder. `next.config.ts` redirects generated from the file plus the category → hub map (§2.1).
- SEO plumbing: `generateMetadata` helper (title ≤ 60, description ≤ 155, canonical with trailing slash, og image route), `sitemap.ts`, `robots.ts`, JSON-LD helpers (Organization sitewide; Article + Person; FAQPage; BreadcrumbList; SoftwareApplication for tools).
- Design tokens only (`src/styles/tokens.css`): one accent, neutrals, 8-px grid, 1.25 type scale, `next/font` for the two typefaces. O2 owns the actual components.
- `content/affiliates.ts` with every partner from §1.2 as entries (`affiliateUrl` empty) and disclosure text; `<PartnerCta>` and `<Annonslank>` primitive components.
- `scripts/verify.mjs`: build, lint, typecheck, legacy-URL check (every entry 200/301 against the local server), frontmatter validation, sitemap contains every article, no page missing title/description, no `example.com`/`#`/lorem in rendered HTML. `tests/screenshots.mjs` (Playwright, `/opt/pw-browsers/chromium`). CI: verify + screenshots artifact on PR.
- Two exemplar MDX files (one guide, one comparison) with placeholder copy so templates have data; O2 replaces them.
- Deploy readiness per `nextjs-deploy-hostinger` (build command, Node version, `output` settings) — not the actual DNS cutover.
- Exit: verify green; `/`, a hub, `/[slug]/` exemplars, `/go/bokio/` (logs + redirects), all three forms (DB row written with no VenderCRM key configured), every legacy URL entry 200 or 301 locally; `docs/log/O1.md`.

### 5.2 O2 Design system & templates
- Load `web-design-system` and `nextjs-national-lead-gen` §4. Archetype B (media/resource brand) blended with a tool-product surface. Patterns chosen: **big-type editorial** (headings, hub pages), **bento grid** (tool cards + hub cards on home), **split hero** with the Bolagsformsväljaren's first question embedded live in the hero (O3 wires it; O2 ships the slot). Restraint baseline from the skill applies. Light theme, one accent (a confident green or deep blue — pick and record), no glassmorphism, no dark-mode-first.
- Components: header (logo wordmark "Starta Eget Företag", nav from `content/nav.ts`: Starta företag · Ekonomi · Affärsidé · E-handel · Hemsida · Marknadsföring · Verktyg · Jämför; mobile drawer), footer (real contact, hub links, legal links, annonspolicy, newsletter), `ArticleTemplate` (breadcrumb, "Uppdaterad", TOC for long guides, source box "Källor", partner CTA blocks, FAQ, related grid, one soft newsletter CTA at the end — never a popup), `ComparisonTemplate` (sticky comparison table, per-row verdict, "bäst för …" badges, Annonslänk marking), `HubTemplate` (intro, featured guide, tool card, article grid by type), `PageTemplate`, `ToolShell` (title, steps, result panel, e-mail-my-result form, partner CTA area), `LeadForm` (byrå), `NewsletterForm`, `Callout`, `Checklist`, `StatRow`.
- Home from `content/home.ts`: hero (promise + embedded tool slot), "Välj verktyg" bento, six hub cards, "Mest lästa guider", "Jämförelser", newsletter band, trust row (sources we cite: Skatteverket, Bolagsverket, Verksamt — logos as text, no fake partner logos).
- Replace the O1 exemplars with two real articles written to full quality as the reference for lane 2: `/starta-aktiebolag/` (legacy, guide) and `/basta-bokforingsprogram/` (new, comparison).
- Exit: verify green; Lighthouse ≥ 90 performance/≥ 95 SEO on `/` and the two exemplars at mobile; no horizontal scroll at 375 px; `docs/log/O2.md`.

### 5.3 O3 Tools
- Load `sweden-business-apps` §8 (anti-fabrication) before writing a single number. `src/lib/tax/constants.ts` = the only place rates live: `{ key, value, unit, validFrom, source, verifiedOn }`. Seed list to verify against Skatteverket/Bolagsverket/Verksamt during the phase: bolagsskatt, egenavgifter (full rate + schablonavdrag), arbetsgivaravgifter, kommunalskatt (national average, labelled), statlig inkomstskatt threshold, grundavdrag approximation, jobbskatteavdrag approximation, 3:12 förenklingsregeln (schablonbelopp + utdelningsskatt), minimum aktiekapital, Bolagsverket fees (AB e-registrering, firmaregistrering enskild firma, ändringsavgifter), momssatser 25/12/6, F-skatt (free), typical prices for bokföringsprogram/företagskonto/försäkring as ranges with partner source pages. Anything unverifiable ships labelled "verifiera" and logged.
- **Tool 1 Bolagsformsväljaren** (`/verktyg/bolagsform/`): 6–8 questions (expected profit, alone or with partners, personal risk, need to invest/retain profit, want to hire, plan to sell company, want to draw salary vs simplicity, side hustle vs full time). Scoring → AB / enskild firma / handelsbolag with a "why" list, "next steps" checklist and partner CTAs (lagerbolag/bolagsbildning for AB, bokföringsprogram for both, byrå lead form). Shareable result URL (query-encoded), e-mail result option.
- **Tool 2 Startkostnadskalkylatorn** (`/verktyg/startkostnad/`): pick bolagsform → line items with defaults from constants, each editable, each with a partner slot; totals "att betala vid start" vs "per månad första året"; download/print checklist; e-mail result.
- **Tool 3 Vad-blir-kvar** (`/verktyg/vad-blir-kvar/`): inputs revenue (exkl. moms), costs, hours; outputs side-by-side enskild firma vs AB net, with the assumptions listed under the result and a big "uppskattning, inte rådgivning" label; CTA to byrå lead form and bokföringsprogram.
- All three: pure functions in `src/lib/tax/*.ts` with unit tests (`tests/tools.spec.ts`, vitest) covering at least 5 cases each; client components, URL-state, no DB except e-mail-my-result. SoftwareApplication JSON-LD. Wire the hero slot on home to tool 1's first question.
- Exit: unit tests green; verify green; the three tool pages render and complete a full run in the scripted Playwright pass; `docs/log/O3.md`. Then §4.10: create the watcher, spawn S4–S8 (max 4 at once).

## 6. Lane 2 — content (Sonnet, parallel) and the link pass

Common rules for S4–S8:
- Each article follows §2.2 and the O2 exemplars in tone and depth: 900–1 800 words for guides, 1 200–2 200 for comparisons, one intent per page, "Uppdaterad" line, ≥ 1 authority source, FAQ of 3–5 questions where natural, partner slots only where the reader is actually choosing a product.
- Legacy slugs are exact — copy from `content/legacy-urls.json`. Never invent a new slug for a page that has a legacy path.
- No year in title or H1. Years only in "Uppdaterad" and in dated facts.
- `related:` stays empty (link pass fills it). Internal links in body text only to hubs and tools (stable URLs) — cross-article links are the link pass's job.
- Same-shaped fan-out: write one article yourself first, then fan out the rest as parallel Sonnet subagents per `fable-directs-sonnet-builds` §Fan-out, review each, one verify, one PR.
- Every image: `image.slot` + alt in frontmatter and one entry in `content/image-briefs/<phase>.json`. Never generate or fetch images in-phase.
- Prices, fees and rates: cite `src/lib/tax/constants.ts` values by key via the `<Stat k="..."/>` component when one exists; otherwise a source link with date; never a bare number.

### 6.1 S4 Starta företag (hub `starta-foretag`) — ~13 articles
Legacy (keep path, rewrite): `starta-eget-foretag` (the cornerstone "så startar du eget, steg för steg"), `starta-aktiebolag` (already written in O2 — S4 only adds it to the hub, no rewrite), plus the legacy enskild firma, bidrag and företagslån posts under their exact legacy slugs.
New: `enskild-firma-eller-aktiebolag` (the comparison that feeds tool 1), `starta-handelsbolag`, `registrera-foretag-bolagsverket` (step by step, fees from constants), `f-skatt` (ansöka, vad det innebär), `momsregistrering`, `starta-eget-bidrag` (Arbetsförmedlingen's stöd, honest about eligibility), `foretagsforsakring` (partner slots), `lagerbolag-eller-nyregistrering`, `starta-foretag-vid-sidan-av-jobbet`, `checklista-starta-foretag` (print-friendly; lead magnet "Första 30 dagarna").
Byrå lead form on every page in this hub.

### 6.2 S5 Ekonomi & jämförelser (hub `ekonomi` + `/jamfor/`) — ~10 articles + 6 comparisons
Legacy: `bast-bank-for-foretag` (or the exact legacy slug — check the file) rewritten as the comparison page, `bokforing-dropshipping` (exact legacy slug) rewritten.
New guides: `bokforing-for-nyborjare`, `lon-eller-utdelning-aktiebolag`, `egenavgifter`, `moms-for-nyforetagare`, `redovisningsbyra-eller-sjalv`, `foretagskonto`, `preliminarskatt`.
Comparisons (`type: comparison`, rows in `content/comparisons/`): `basta-bokforingsprogram` (O2 wrote it — S5 owns the rows file updates only), `basta-foretagsbank` (= the legacy bank slug), `basta-foretagsforsakring`, `basta-kassasystem`, `basta-faktureringsprogram`, `basta-lagerbolag`. `/jamfor/` hub content in `content/hubs.ts` is O2's; S5 adds rows only.

### 6.3 S6 Affärsidé & affärsplan (hub `affarside`) — ~8 articles + 2 lead magnets
Redirect targets: `affarsideer` (new, merges the two dated posts: 50+ idéer grouped by capital/skill/time, evergreen), `affarsplan` (legacy or new — check file), `affarsplan-mall` (legacy slug), `affarsplan-exempel` (legacy slug).
New: `validera-affarside`, `hitta-affarside`, `affarsideer-liten-budget`, `affarsideer-vid-sidan-av-jobbet`, `prissattning-nyforetagare`.
Lead magnets in `content/lead-magnets/`: affärsplan-mall (structured MD → the build renders a printable page; PDF export via print CSS), startkostnads-checklista (feeds tool 2 CTA).

### 6.4 S7 E-handel & hemsida (hubs `e-handel`, `hemsida`) — ~13 articles
Legacy: `ehandel` (redirect target, from `/ehandel-2024/`), `dropshipping-sverige`, `skapa-hemsida-med-wordpress`, `wordpress-teman`, `basta-webbhotellet` (comparison), `webbhotell` (guide: what it is, how to choose — distinct intent from the comparison), plus the legacy domän, webshop and konverteringsoptimering slugs.
New: `starta-webshop`, `basta-e-handelsplattform` (comparison, Shopify/Wikinggruppen/Quickbutik/WooCommerce), `registrera-doman`, `hemsida-for-foretag-kostnad`, `wordpress-eller-hemsidebyggare`.

### 6.5 S8 Marknadsföring & sidor (hub `marknadsforing` + `content/pages`) — ~9 articles + 7 pages
Legacy: `seo-guide`, the Google Ads, Instagram, sociala medier, SMMA and AI-agency legacy slugs, rewritten with years removed and the byrå-model pieces reframed as "starta byrå" business-idea guides.
New: `marknadsforing-nyforetagare` (cornerstone), `google-foretagsprofil`, `nyhetsbrev-for-smaforetag`.
Pages: `om-oss` (who writes this, method, sources), `kontakt`, `annonspolicy`, `integritetspolicy` (GDPR-correct: what the forms store, VenderCRM as biträde, cookie policy), `villkor`, `nyhetsbrev` (landing with the three magnets), `redovisningsbyra` (lead-gen landing).

### 6.6 S9 Link pass (Sonnet, after all lane 2 PRs merge)
Fill `related:` (2–4 per article, within and across hubs), add cross-article links in bodies where a guide names a concept another guide owns, add tool CTAs to the articles that match each tool, check `content/nav.ts` and hub featured lists, verify every legacy URL, every hub and every tool appears in the sitemap, promote open cross-phase items to `KNOWN-ISSUES.md`, run verify + one full screenshot pass, close with the report. Delete the watcher Routine first.

## 7. Human-inputs checklist

| # | Item | Needed by |
|---|---|---|
| 1 | Complete `content/legacy-urls.json` with all 48 exact WordPress paths (export from WP admin or your Playwright scan). The sandbox cannot reach the domain. Seed committed with the slugs known so far. | O1 (redirects) — O1 proceeds with the seed; S4–S8 need the full list |
| 2 | Hostinger Node.js slot + MySQL database, `DATABASE_URL` and Remote MySQL whitelist per `nextjs-deploy-hostinger` | O1 for live deploy; local build works without |
| 3 | VenderCRM tenant API key + endpoint for `/api/lead` | O1 (falls back to DB-only) |
| 4 | Resend (or other) API key for e-mail-my-result and newsletter double opt-in | O3 (falls back to DB-only) |
| 5 | Affiliate program enrolments (Adtraction/Adrecord/Tradedoubler, direct programs) → paste tracking URLs into `content/affiliates.ts` | after lane 2; plain links until then |
| 6 | Real contact details for footer/kontakt (company name, org.nr, e-mail, city) | S8 |
| 7 | Imagery: run the Higgsfield → webimg pipeline on `content/image-briefs/*.json` from your PC per `higgsfield-image-pipeline` (sandbox 403s on the CDN) — a manual step, not a phase | after link pass |
| 8 | Domain cutover: map startaegetforetag.se to the Node slot, keep WP export, switch off WP | after 7 |
| 9 | Google Search Console: submit new sitemap, monitor the 301s for 4 weeks | after 8 |

### 7.1 Redirect map — dated URLs (the three required 301s)

| Old | New | Note |
|---|---|---|
| `/affarsideer-2023/` | `/affarsideer/` | merged into one evergreen list |
| `/affarsideer2024/` | `/affarsideer/` | merged into one evergreen list |
| `/ehandel-2024/` | `/ehandel/` | same intent, dateless |

Plus, generated from `content/legacy-urls.json` and §2.1: every `retire` entry → its hub; `/category/<x>/` → hub; `/feed/`, `/author/*`, `/page/*`, `/tag/*` → `/` (410 is acceptable for `/wp-content/uploads/*` since no images are kept). Title/H1-only years (starta-aktiebolag, dropshipping-sverige, skapa-hemsida-med-wordpress, wordpress-teman, basta-webbhotellet, webbhotell, starta-eget-foretag, smma) need no redirect — same path, rewritten copy.

## 8. Open business questions (parked)
- Sell byrå leads per lead, or partner exclusively with one national byrå? Decide once leads exceed ~20/month.
- Affiliate vs direct sponsorship for the comparison pages (a "featured" slot sold directly pays more than network CPA once traffic is there).
- Should the tools get English mirrors for foreign founders in Sweden? Not in scope; note demand from Search Console.

## 9. Build log index
| Phase | PR | Log |
|---|---|---|
| (plan) | — | — |
| O1 Foundation | #2 | `docs/log/O1.md` |
| O2 Design & templates | #4 | `docs/log/O2.md` |
| O3 Tools | #5 | `docs/log/O3.md` |
| S6 Affärsidé & affärsplan | #7 | `docs/log/S6.md` |

## 10. Backlog
- Affärsplan-generator (form → PDF), gated by e-mail.
- Company-name availability + domain checker.
- Display ads once > 20k sessions/month.
- Paid "Starta AB-paketet" (checklists + mallar) or a byrå-matching service.
- English mirror of the three tools.
- Comments / community.
