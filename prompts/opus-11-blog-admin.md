# Phase B1 — Blog admin. OPUS session (or Opus subagent directed from Anton's planning session). Lane 1, after D1 merges; may run while S-phases are still open.

Read ONLY: this file, `plan.md` §1.3, §2.2, §4, §5.5, the phase table and §9, `docs/log/O1.md`, `docs/log/D1.md`, `src/lib/content/README.md`, and `docs/design/verkstan.md` §2 "Admin". Load the `nodejs-mysql-hostinger-stack` skill §auth pattern only if it exists on this account; otherwise the spec in §5.5 is complete.
Execute under the autonomy protocol §4. Build nothing outside the plan.

Owns (the only paths you may create or modify, plus §4.9 exceptions):
- `src/app/admin/**`, `src/app/api/admin/**`, `src/lib/admin/**`, `src/middleware.ts`
- `src/lib/content/schema.ts` — additive only: `blogg` in `HUBS`, `post` in `ARTICLE_TYPES`
- `src/app/robots.ts` (add the `/admin/` disallow), `src/styles/admin.css` (new file, imported by the admin layout only)
- `content/hubs.ts` and `content/nav.ts` — add the `blogg` hub / footer item only
- `content/articles/blogg/**`, `.env.example`, `tests/admin.e2e.mjs`, `tests/admin.spec.ts`, `docs/log/B1.md`

Hard limits: no change to the public templates, tokens or `components.css` (D1's), no DB table unless a requirement in §5.5 cannot be met without one (it can), no new runtime dependency for the editor (plain textarea + server actions). Never commit a token or password; `.env.example` gets names and comments only.

Budget: one session, ≤ 2 h. When the exit criteria pass, open the PR that turn (§4.13).

Phase rules:
- Branch `phase/B1` off latest main. WIP commit every 30 min.
- Order: schema additions + `blogg` hub + seed post → auth + middleware → store with `local` backend → list + editor screens + preview + link picker → `github` backend → validation gate → e2e + unit tests → log.
- The store is the only module that knows whether a file lives on disk or in GitHub. Screens call the store. Write the GitHub backend against the REST Contents API with `fetch`; no Octokit.
- Validation gate: `articleFrontmatterSchema` + MDX compile + slug collision check (reuse O1's) + internal-link resolution. An invalid file is never written to either backend.
- Sessions: HMAC-SHA256 over `expires.nonce` with `ADMIN_SESSION_SECRET`; compare with `crypto.timingSafeEqual`. No JWT library.
- Admin pages: `export const dynamic = "force-dynamic"`, `robots: { index: false }`, no site header/footer, `admin.css` only.
- The seed post in `content/articles/blogg/` is real copy (what the relaunch changed and why, du-form, links to the three tools and `/om-oss/`), frontmatter per §2.2 with `type: post`.
- Re-runnable; minor issues → `docs/log/B1.md`; stop only per §4.4 (a missing `GITHUB_TOKEN` is not a stop — local mode is the fallback).

Exit: verify green; `npm test` green (incl. the frontmatter round-trip spec); `node tests/admin.e2e.mjs` green in local mode; `/admin/` unauthenticated → 302 `/admin/login/`; admin HTML carries `noindex`; `/blogg/` renders the seed post and appears in the sitemap; PR merged; `docs/log/B1.md` + §9 index line; `.env.example` and plan §7 rows 10–12 consistent with what you built.

## After this phase
Follow `prompts/_handoff.md`. Spawn nothing.
