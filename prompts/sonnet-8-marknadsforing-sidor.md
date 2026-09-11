# Phase S8 — Marknadsföring & static pages. SONNET session. Lane 2, runs in parallel with the other S phases.

Read ONLY: this file, `plan.md` §1, §2.2, §4, §6 (common rules) and §6.5, the phase table and §9, `docs/log/O2.md`, `docs/log/O3.md`, and the two O2 exemplar articles as the quality reference. Do not read the rest.
Execute under the autonomy protocol §4. Build nothing outside the plan.

Owns (the only paths you may create or modify, plus §4.9 exceptions):
- `content/articles/marknadsforing/**`, `content/pages/**`, `content/image-briefs/s8.json`, `docs/log/S8.md`

Hard limits: no changes to `src/**`, templates, routing, schema, tokens, tax constants, `content/nav.ts`, `content/hubs.ts` or `content/home.ts`. Need something there? One line in `docs/decisions-needed.md` + workaround. Leave `related:` empty — the link pass fills it.

Budget: one session, ≤ 90 min. When the exit criteria pass, open the PR that turn (§4.13).

Phase rules:
- Branch `phase/S8` off latest main. WIP commit every 30 min.
- Slugs: legacy pages use the exact path from `content/legacy-urls.json`; if the file is still `"complete": false` and a legacy slug you need is missing, use the slug named in plan §6.5 and log it under Known issues.
- Write the first (cornerstone) article yourself to O2 quality, then fan out the rest as parallel Sonnet subagents per `fable-directs-sonnet-builds` §Fan-out (one brief per article: title, intent, outline, sources, partner slots, FAQ). Review each result against §6 common rules before the one verify run.
- Du-form, closed compounds, no anglicisms in headings, no year in title/H1, "Uppdaterad" line, ≥ 1 authority source per guide, numbers via `<Stat k="..."/>` or a dated source link — never bare.
- Images: frontmatter slot + alt, and one entry per image in your `content/image-briefs/` file. Never generate or fetch images.
- Static pages: real contact details come from plan §7 item 6; if not yet filled in, use the company name only and log it — never `example.com`, never a placeholder address (verify fails on them).
- `integritetspolicy` must describe exactly what the forms store (see §2.4) and name VenderCRM and the e-mail provider as biträden. `annonspolicy` explains Annonslänk marking in plain Swedish.
- SMMA / AI-agency legacy posts become "starta byrå" business guides — remove years, keep the slugs.
- Re-runnable; minor issues → `docs/log/S8.md`; stop only per §4.4.

Exit: every article in §6.5 exists and renders; verify green (frontmatter validation passes, sitemap lists them all); one screenshot pass (≤ 5 pages × 2 widths); PR merged; `docs/log/S8.md`.

## After this phase
Follow `prompts/_handoff.md`. Spawn nothing.
