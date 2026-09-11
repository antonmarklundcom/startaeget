# Phase S5 — Ekonomi & jämförelser. SONNET session. Lane 2, runs in parallel with the other S phases.

Read ONLY: this file, `plan.md` §1, §2.2, §4, §6 (common rules) and §6.2, the phase table and §9, `docs/log/O2.md`, `docs/log/O3.md`, and the two O2 exemplar articles as the quality reference. Do not read the rest.
Execute under the autonomy protocol §4. Build nothing outside the plan.

Owns (the only paths you may create or modify, plus §4.9 exceptions):
- `content/articles/ekonomi/**` (except `basta-bokforingsprogram.mdx` body — you may only update its comparison rows file)
- `content/comparisons/**`, `content/image-briefs/s5.json`, `docs/log/S5.md`

Hard limits: no changes to `src/**`, templates, routing, schema, tokens, tax constants, `content/nav.ts`, `content/hubs.ts` or `content/home.ts`. Need something there? One line in `docs/decisions-needed.md` + workaround. Leave `related:` empty — the link pass fills it.

Budget: one session, ≤ 90 min. When the exit criteria pass, open the PR that turn (§4.13).

Phase rules:
- Branch `phase/S5` off latest main. WIP commit every 30 min.
- Slugs: legacy pages use the exact path from `content/legacy-urls.json`; if the file is still `"complete": false` and a legacy slug you need is missing, use the slug named in plan §6.2 and log it under Known issues.
- Write the first (cornerstone) article yourself to O2 quality, then fan out the rest as parallel Sonnet subagents per `fable-directs-sonnet-builds` §Fan-out (one brief per article: title, intent, outline, sources, partner slots, FAQ). Review each result against §6 common rules before the one verify run.
- Du-form, closed compounds, no anglicisms in headings, no year in title/H1, "Uppdaterad" line, ≥ 1 authority source per guide, numbers via `<Stat k="..."/>` or a dated source link — never bare.
- Images: frontmatter slot + alt, and one entry per image in your `content/image-briefs/` file. Never generate or fetch images.
- Comparisons are the money pages: every row needs price (with source URL + date), "bäst för", a verdict, and an honest downside. Partners without an affiliate URL still get a plain link — never omit a strong product because it has no program.
- Load `sweden-business-apps` §1 and §8 before writing bokföring/moms/lön copy.
- Re-runnable; minor issues → `docs/log/S5.md`; stop only per §4.4.

Exit: every article in §6.2 exists and renders; verify green (frontmatter validation passes, sitemap lists them all); one screenshot pass (≤ 5 pages × 2 widths); PR merged; `docs/log/S5.md`.

## After this phase
Follow `prompts/_handoff.md`. Spawn nothing.
