# Evaluation checkpoint

**Draft, October 21, 2026.** The earlier single-start evidence is preserved in
[docs/EVALUATION.md](docs/EVALUATION.md). Five real scripted-baseline episodes
ran 400 actions in total; all reached the action limit alive and none cleared
the level. The one image-model attempt failed reauthentication before any game
action. Its unknown-use reservation remains $0.0111104. No live-model playing
ability or benefit from memory has been demonstrated.

The new [situation declaration](docs/SITUATIONS.md) fixes three original
level-one starts: entrance (development), clearing and door (held out).
Each uses normal controls from a fresh process. Score is 1 for an original
level exit and 0 otherwise; death and all limits/failures retain their reasons.
All policies get the same PNG/HUD, static action schema, 80-action cap and
2,000 player-tick allowance. Preparation is excluded from player history,
actions and ticks and reported separately. The current/history ablation uses
the same model/prompt with zero versus three previous permitted frames/actions.
The visual baseline has its own navigation memory and no hidden map access.

`config/midterm-v2.json` plans 18 trials: two seeds per case for baseline,
current and history. The model order alternates. It reserves at most $0.20 per
model episode, with a $3 cumulative suite ceiling. This is a **preflight**
configuration: access, dated prices, baseline calibration and final policy
freeze remain outstanding. No held-out policy trials were run for this checkpoint.

After those prerequisites, from `midterms/demonrain7/`:

```bash
uv run --frozen python scripts/evaluate.py --exe build/catacomb --data data/original --output runs/final-suite-001 --config config/midterm-v2.json --prior-estimated-usd 0.0111104
```

Replace that prior estimate with the complete cumulative amount including any
later pilot/failure; do not reset it to zero. Use `build/catacomb.exe` on Windows.
This command makes live requests. A fresh output directory retains the frozen
configuration/source hashes, case ordering, every attempted/unattempted result,
termination reason, actions/ticks, invalids, model version, latency, tokens and
estimated cost. `REPORT.md` and `by-situation.json` report overall and per-case
outcomes. Credential/provider exception bodies and original rendered frames
remain local and must be reviewed before any publication.

Current engineering checks are in [checkpoint evidence](docs/evidence/checkpoint-20261021.md).
They establish deterministic mechanics, reset/accounting and information
boundaries; offline fixtures are not substitutes for the missing live table.
These three starts share one known map. Repetitions do not establish unseen-map
generalization, and no training or learning claim is made.

Pending final additions: frozen-player comparison table with actual traces,
failure/cost interpretation, actual peer notes, student's limitations and
recording link. Resource delivery to a fresh recipient is also unresolved.

October 21 course-folder preflight: the unchanged baseline completed 80 actions
on `s1-entrance`, stopped at 640 player ticks / native tick 641 with score 0,
and made no paid requests. [Actual result and trace](docs/evidence/situation-preflight-20261021/result.json)
are separate from the final 18-trial study. No held-out policy trial was run.
[Project CI passed](docs/evidence/course-ci-20261021.json) on Linux/macOS and in
the player/browser jobs; the shared minigame guard still rejects the required
root workflow. The PR reports that repository-level conflict explicitly.
