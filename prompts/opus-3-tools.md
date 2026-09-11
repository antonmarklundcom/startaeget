# Phase O3 — Tools. OPUS session. Lane 1 (last).

Read ONLY: this file, `plan.md` §1, §2, §4, §5.3, the phase table and §9, `docs/log/O1.md`, `docs/log/O2.md`. Depends on: O1, O2. Do not read the rest.
Execute under the autonomy protocol §4. Build nothing outside the plan.

Owns: `src/app/(site)/verktyg/**`, `src/components/tools/**`, `src/lib/tax/**`, `content/tools.ts`, `tests/tools.spec.ts`, the hero tool slot wiring in `src/components/home/*`, `docs/log/O3.md`.

Budget: one session, ≤ 90 min. When the exit criteria pass, open the PR that turn (§4.13).

Phase rules:
- Branch `phase/O3` off latest main. WIP commit every 30 min.
- Load skills: `sweden-business-apps` §8 first (anti-fabrication), then `web-design-system` for the tool UI.
- `src/lib/tax/constants.ts` is the only place a rate, fee or threshold may live: `{ key, value, unit, validFrom, source, verifiedOn }`. Verify each value against Skatteverket/Bolagsverket/Verksamt during the phase; if the sandbox cannot reach a source, ship the value flagged `verified: false` and list it in the log — never silently guess.
- Math is pure functions with vitest tests (≥ 5 cases per tool); UI is client components with URL state. Results say "uppskattning" visibly. No advice claims.
- Every result panel ends in partner CTAs from `content/affiliates.ts` and the byrå lead form. E-mail-my-result posts to `/api/tool-result` and degrades to DB-only.
- SoftwareApplication JSON-LD per tool; `content/tools.ts` feeds `/verktyg/` and the home bento.
- One scripted Playwright pass completing each tool end to end, saved as `tests/tools.e2e.mjs`.
- Re-runnable; minor issues → `docs/log/O3.md`; stop only per §4.4.

Exit: vitest green; verify green; `/verktyg/`, `/verktyg/bolagsform/`, `/verktyg/startkostnad/`, `/verktyg/vad-blir-kvar/` complete a full run in the e2e pass; home hero slot asks tool 1's first question and hands off to the tool; PR merged; `docs/log/O3.md`.

## After this phase
Follow `prompts/_handoff.md`: create the watcher Routine, then spawn S4, S5, S6, S7 (Sonnet, 4 at once); the watcher starts S8. End with your phase report.
