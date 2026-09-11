# Phase D1 — Verkstan design. OPUS session (or Opus subagent directed from Anton's planning session). Lane 1, runs in parallel with S4–S8.

Read ONLY: this file, `docs/design/verkstan.md` (the contract — read it in full), `plan.md` §1.8, §4, §5.4, the phase table and §9, `docs/log/O2.md` and `docs/log/O3.md`. Then the code you change. Do not read the rest of the plan or any S-phase material.
Execute under the autonomy protocol §4. Build nothing outside the plan.

Owns (the only paths you may create or modify, plus §4.9 exceptions):
- `src/**` except `src/lib/tax/**` (maths, constants, tests) and `src/app/api/**`
- `content/hubs.ts` (add `tint`), `content/home.ts`, `content/tools.ts` (add `tint`, `minutes`)
- `tests/screenshots.mjs` (route list only), `tests/tools.e2e.mjs` (selectors only, and only if a selector must change — say so in the log)
- `docs/design/**`, `docs/log/D1.md`

Hard limits: no change to any frontmatter field, MDX component name or prop, route, redirect, API handler, tax constant, DB schema or the comparison rows shape. `content/articles/**` and `content/comparisons/**` are lane 2's — never touch them. A lane 2 PR may merge into main while you work: `git merge main` before opening the PR; main wins on conflict.

Budget: one session, ≤ 2 h. When the exit criteria pass, open the PR that turn (§4.13).

Phase rules:
- Branch `phase/D1` off latest main. WIP commit every 30 min.
- Order: tokens + fonts + layout `data-hub` mechanism → header/footer → home → article/comparison/hub/page templates + MDX blocks + forms → tool shell + the three tools' result panels and inputs → screenshots/Lighthouse → log.
- `docs/design/verkstan.md` is decided. Where the canvas and the file differ, the file wins. Where the file is silent, choose the plainest option consistent with it and record the choice in `docs/log/D1.md` "Decisions".
- Rewrite `src/styles/components.css` and `src/components/tools/tools.css` rather than patching: O2's table, serif and blue are gone, not overridden. Keep every class the e2e script queries or update the script in the same commit.
- Nothing fabricated on any surface (plan §4.16): no usage counters, reader counts, fake avatars or "mest lästa" numbers. Real article counts per hub come from the loaders.
- Run `npm test`, `node tests/tools.e2e.mjs` and `node scripts/verify.mjs` before the PR; fix until green. One Lighthouse run (mobile) on the four routes named in `docs/design/verkstan.md` §3; if a score misses, fix and re-run once.
- Re-runnable; minor issues → `docs/log/D1.md`; stop only per §4.4.

Exit: verify green; `npm test` green; `tests/tools.e2e.mjs` green; Lighthouse mobile ≥ 90 perf / ≥ 95 a11y / ≥ 95 SEO on `/`, `/starta-aktiebolag/`, `/basta-bokforingsprogram/`, `/verktyg/bolagsform/`; no horizontal scroll at 375 px; screenshot pass (5 routes × 2 widths) in the PR CI artifact; PR merged; `docs/log/D1.md` + §9 index line.

## After this phase
Follow `prompts/_handoff.md`. Spawn nothing — B1 is started from Anton's planning session. Do not touch the watcher Routine.
