# Phase O1 — Foundation. OPUS session. Lane 1.

Read ONLY: this file, `plan.md` §1, §2, §4, §5.1, the phase table and §9. Depends on: nothing. Do not read the rest.
Execute under the autonomy protocol §4. Build nothing outside the plan.

Owns: `src/**`, `drizzle/**`, `scripts/**`, `tests/**`, `.github/**`, root config files (`package.json`, `next.config.ts`, `drizzle.config.ts`, `tsconfig.json`, `tailwind.config.*`, `.env.example`, `.gitignore`), `content/legacy-urls.json`, `content/affiliates.ts`, `content/articles/_exemplar-*.mdx`, `docs/log/O1.md`.

Budget: one session, ≤ 90 min. When the exit criteria pass, open the PR that turn (§4.13).

Phase rules:
- Branch `phase/O1` off latest main. WIP commit every 30 min.
- Load skills: `nodejs-mysql-hostinger-stack` (scaffold, §1), `nextjs-deploy-hostinger` (build/deploy readiness only), `vendercrm-lead-capture` (for `/api/lead`), `nextjs-national-lead-gen` §3 (SEO checklist).
- The content contract (§2.2–2.4) is the whole point of this phase: zod-validate frontmatter at build time, document the shape in `src/lib/content/README.md`, and make the loader the only way pages get data. Sonnet phases will only ever write MDX + TS content files.
- Redirects come from `content/legacy-urls.json` + the category → hub map (§2.1). Try to fetch the live sitemap to complete the file; if the host is blocked, keep `"complete": false` and note it in the log. Trailing slashes on, `/go/` noindex + robots-disallowed.
- Tokens only (`src/styles/tokens.css`), no components beyond layout shell + `<PartnerCta>`/`<Annonslank>` primitives. O2 designs.
- Forms must work with no env vars set: DB row only, no crash, no 500. Everything in `.env.example` with a one-line source comment.
- `scripts/verify.mjs` is the contract every later phase runs; make it fast (< 3 min) and its failures readable.
- Re-runnable; minor issues → `docs/log/O1.md`; stop only per §4.4.

Exit: `node scripts/verify.mjs` green (build, lint, typecheck, frontmatter validation, legacy-URL 200/301 check, sitemap completeness, no `example.com`/`#`/lorem); `/`, `/starta-foretag/`, both exemplar `/[slug]/` pages, `/go/bokio/` (DB row + 302 to fallback url) and the three POST routes work locally; CI workflow runs verify + uploads screenshots artifact on PR; PR merged; `docs/log/O1.md`.

## After this phase
Follow `prompts/_handoff.md`. Next: `prompts/opus-2-design-templates.md`, model Opus.
