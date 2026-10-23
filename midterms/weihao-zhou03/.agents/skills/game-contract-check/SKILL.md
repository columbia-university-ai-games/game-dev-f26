---
name: game-contract-check
description: Check Echo Fishery changes for observation parity, fixed-step timing, deterministic replay and bounded player execution. Use for this game's interface, renderer integration and runner reviews.
---

Read `src/core/types.ts`, project `AGENTS.md`, and the relevant original design rows in `docs/RULES-SOURCE-MAP.md`.

Trace an action through validation, engine resolution, public observation and player/UI consumption. Check: current fish cue applies to the submitted reel; only previously announced attacks resolve; echo centers never follow hidden entities; all important audio/UI events derive from the public projection; invalid actions reveal no hidden occupancy; observe/legal_actions never advance time or consume randomness; world time is independent of API latency and animation.

For runners check hard step/call/timeout limits, counted failed calls, labeled fallbacks, independent no-history contexts and no private state in prompts. For integration replay identical seed/config/actions through both entrances and compare canonical outcomes. Inspect meaningful existing tests; add tests only inside an authorized implementation task.

Report checked files, concrete findings, actual commands/results and unresolved checks. A read-only invocation must not change code. Never label mock/replay as live or treat passing tests as human playtest evidence.
