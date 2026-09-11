# Phase handoff (plan §4.10)

A phase is done only when all four gates pass, in this order:
1. PR merged green (`phase/<id>` → main, squash). Re-read your prompt file from main before opening and before merging; follow the newer version.
2. Exit checklist in your prompt passed on main.
3. Pre-handoff audit: ONE `node scripts/verify.mjs` on main + ONE adversarial re-read of the merged diff; fix findings in ONE follow-up commit; no second round.
4. `docs/log/<id>.md` committed (≤ 12 Built / ≤ 8 Decisions / ≤ 8 Known issues / 1 Verification line) and the index line added to `plan.md` §9.

Then, by lane:
- **Lane 1 (O1, O2):** spawn the next lane 1 phase with `create_session`: inherit environment and permission mode (never `plan`), `model` set explicitly from the phase table (Opus = current Opus id from the `claude-api` skill), `prompt` exactly: `Read prompts/<next-file>.md in this repo and execute it.` Then end with your phase report.
- **O3 (last lane 1):** create the watcher Routine with `create_trigger`: hourly cron, `create_new_session_on_fire: true`, `model` = current Sonnet id, `prompt` exactly `Read prompts/_watcher.md in this repo and execute it.`, `initiation: human_schedule`. Then spawn S4, S5, S6, S7 (4 at once) the same way with `model` = Sonnet; the watcher starts S8 when a slot frees. End with your phase report.
- **Lane 2 (S4–S8):** spawn nothing. End with your phase report.
- **S9 link pass:** delete the watcher Routine (`list_triggers` → `delete_trigger`), then STOP with the closing report.

Never message a running session. Never use a Fable/Mythos-class model for anything spawned (plan §4.8).
Fallback without `create_session`: continue in the same window if the next phase uses the same model; otherwise stop and report which prompt to paste next and on which model.
