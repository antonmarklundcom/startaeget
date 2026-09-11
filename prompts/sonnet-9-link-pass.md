# Phase S9 — Link pass. SONNET session. Sequential, after every S4–S8 PR is merged.

Read ONLY: this file, `plan.md` §1, §2, §4, §6.6, the phase table and §9, `docs/log/S4.md` … `docs/log/S8.md`, and `docs/design/verkstan.md` §2 (so the screenshot pass judges the right design). Do not read the rest.
Execute under the autonomy protocol §4.

Owns: `related:` and body cross-links in any `content/**` article, `content/nav.ts`, `content/hubs.ts` featured lists, `KNOWN-ISSUES.md`, `plan.md` §9, `docs/log/S9.md`. No `src/**` changes.

Budget: one session, ≤ 90 min.

Phase rules:
- Branch `phase/S9` off latest main.
- Fill `related:` with 2–4 slugs per article (same hub first, then the natural cross-hub link). Add in-body links where a guide names a concept another article owns. Add the matching tool CTA to every article whose intent matches tool 1, 2 or 3.
- Check every hub's featured list and the home "Mest lästa" list point at real slugs. Check `content/legacy-urls.json`: every `keep` entry has an article, every `redirect`/`retire` target exists.
- Promote still-open cross-phase Known issues from the S logs to `KNOWN-ISSUES.md`; leave phase-local ones where they are.
- One verify run, one full screenshot pass (home, each hub, one article per hub, each tool, at 2 widths).
- Closing report: what shipped, open items in `KNOWN-ISSUES.md`, the §7 steps Anton still owes (images, affiliate URLs, cutover, Search Console).

Exit: verify green; no article with empty `related:`; sitemap contains every article, hub, tool and page; PR merged; `docs/log/S9.md`.

## After this phase
Delete the watcher Routine (`list_triggers` → `delete_trigger`), then STOP with the closing report. Spawn nothing.
