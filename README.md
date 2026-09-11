# startaegetforetag.se

Founder-first guides, comparisons and decision tools for people starting a
company in Sweden. Next.js 15 (App Router) + MySQL/Drizzle on a Hostinger
Node.js slot. The build plan lives in [`plan.md`](plan.md); phase prompts in
[`prompts/`](prompts/).

## Run it

```bash
npm install
cp .env.example .env      # every var is optional locally
npm run dev               # http://localhost:3000
```

Nothing requires a database, a CRM key or a mail key to run: forms log instead
of storing, `/go/` links fall back to plain partner URLs, and pages render.

## Checks

```bash
node scripts/verify.mjs        # the contract: build, typecheck, lint, content,
                               # legacy URLs, sitemap, forms, /go/  (~1 min)
node scripts/verify.mjs --fast # reuse the existing .next
node tests/screenshots.mjs     # 2 widths, asserts no horizontal scroll
npm test                       # unit tests (vitest)
```

CI runs `scripts/verify.mjs` on every PR and uploads the screenshots as an
artifact.

## Content

Everything under `content/` — MDX articles, comparison rows, hubs, nav, home,
tools, the partner registry and the legacy URL map. The shape is documented in
[`src/lib/content/README.md`](src/lib/content/README.md) and validated by zod at
build time: a bad field fails the build with the file and the field named.

## Deploy (Hostinger Node.js slot)

- Node 22 (`.nvmrc`), build `npm run build`, start `npm start`.
- Set every variable from `.env.example` in hPanel — never commit a real `.env`.
- `DATABASE_URL` points at the Hostinger MySQL database; Remote MySQL must
  whitelist the app host. Apply `drizzle/` with `npm run db:push`.
- See the `nextjs-deploy-hostinger` skill for the account/slot map, the Remote
  MySQL whitelist step and the known traps.
