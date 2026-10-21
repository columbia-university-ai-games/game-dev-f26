---
name: catacomb-validation
description: Build and validate this Catacomb II reconstruction, record a headless interface trace, and distinguish rule, integration and fidelity evidence. Use for Catacomb project checkpoints and regressions.
---

# Catacomb validation

Use the modified project containing `agent_bridge.c`, `scripts/catacomb_env.py` and `docs/INTERFACE.md`. Preserve the user's chosen game and bounded scope. This workflow grants no publishing or submission permission.

Read `docs/INTERFACE.md` for the action contract and `docs/RULE_SOURCE_MAP.md` for the rule under test. On a build failure, read `docs/VALIDATION.md` for known Windows fixes and `MAC_HANDOFF.md` for Mac setup. Locate the project root rather than assuming the working directory is correct.

## Execute

- Build with the local C compiler and SDL2. On Mac, `bash scripts/build-macos.sh`; elsewhere use the configured CMake build. Do not reuse a Windows build cache on Mac.
- Run `ctest --test-dir build --output-on-failure` for asset-free rule/protocol/client checks.
- Verify separately obtained original resources with `python scripts/verify_assets.py --data data/original` (use `python3` where appropriate). Do not download or publish assets merely because their hashes are known.
- For player/evaluation changes, use the locked environment: `uv sync --frozen`, then `uv run --frozen python -m unittest discover -s tests -p 'test_players*.py' -v`. Package/player-host changes use `python -m unittest discover -s tests -p test_release.py -v` (also registered with CTest).
- If original resources are available, run `python tests/test_live_game.py --exe build/catacomb.exe --data data/original` on Windows. Use `python3` and `build/catacomb` on Mac/Linux. If CTest already ran `real_asset_integration`, do not duplicate it without a new reason.
- For a classroom trace, run `python scripts/record_week4_demo.py` (or `python3`). It creates a fresh run directory and uses the real engine. Inspect initial, charge, release and nuke frames, the final status, and stderr. Run the interactive `--human` option only when a visible game is wanted.

The adapter defaults to dummy video/audio drivers. Keep this default when the user needs their desktop. A crashed process must be reported with its error log, not replaced by an invented successful screenshot.

## Preserve these invariants

- Observation and invalid requests do not advance ticks or change the visible image.
- Actions have 1–32 ticks and at most one consumable. A terminal episode rejects further steps.
- First observation is tick 1. The world pauses between actions; this is not real-time reaction testing.
- Only pixels/HUD and documented metadata reach a future player. Run paths, source, hidden map and object state belong to the trusted evaluator.
- Model current/history contexts, strict decisions and budget limits are implemented in `scripts/player_contract.py`. Never give the runtime player the browser owner key or the acceptance route. Use `--player-only` for peer browser hosting.
- Original `.CA2` data and `runs/` stay out of the shared source package. Record hashes and provenance instead.

## Report evidence precisely

Record the platform, commands and outcomes, changed behavior, representative trace location and limitations. Label native fixture tests, real-resource integration tests, original-game comparisons, human playtests and live-model evaluations separately. The fixed demo is neither a competent baseline nor a model player. A self-check is not an independent review. Keep unresolved Mac, fidelity or model work visible in the checkpoint record.

For live evaluation, read `docs/EVALUATION.md` and the actual budget before
running `scripts/evaluate.py`. Restore the already authorized provider login
when required; never substitute offline fixtures for live results. Carry forward
earlier reserved cost, keep failed/unattempted cases, and freeze new settings in
a new suite. A provider/harness failure stops dependent trials with the correct
cause. Do not repeat paid runs when nothing has changed.

For a release, read `docs/RELEASE.md`, package a clean committed revision, verify
source/binary/resource hashes, and exercise the extracted candidate. No new
NPC behavior is authorized before the user's requested design discussion.
