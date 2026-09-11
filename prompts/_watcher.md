# Watcher — Sonnet, runs hourly from a Routine, ends within minutes

Read ONLY: `plan.md` phase table and §9, `docs/decisions-needed.md`, git branch state and open PRs (GitHub MCP). Never edit code, never answer design questions, never message a session.

For each lane 2 phase (S4–S8) and S9 decide:
- **merged** — PR merged → nothing.
- **running** — branch `phase/<id>` has a commit < 90 min old → nothing.
- **stalled** — branch exists, last commit ≥ 90 min old, PR not merged → if the PR is open and green, merge it and mark done; otherwise re-spawn the phase (`create_session`, Sonnet, inherit environment/permission mode, prompt `Read prompts/<file>.md in this repo and execute it.`). Prompts are re-runnable.
- **not started** — no branch → spawn it if fewer than 4 lane 2 sessions are running. **Exception (plan §4.15a): never spawn S4, S5, S6 or S7 from "not started" — Anton runs those in his own windows and their branches appear when they push.** Only S8 (and S9 below) may be started by the watcher. Never spawn D1 or B1 either.

When every S4–S8 PR **and the D1 PR** are merged and S9 has no branch: spawn S9 (Sonnet). D1 (branch `phase/D1`) is not yours to spawn or restart; if it is stalled, note it in the notification to Anton instead.
If `docs/decisions-needed.md` has unanswered entries: push one notification to Anton with the questions verbatim (once per question — note delivered ones in the file under a "Notified" line).
Count firings in `docs/log/_watcher.md` (one line per run). After 10 firings with the build not done: notify Anton, disable this Routine (`update_trigger enabled=false`), end.
Model guardrail: never spawn on a Fable/Mythos-class model.
