# Agent team — factual record for student verification

This is an assistant-prepared factual record. The student must verify it and write their own short decisions/reflection before submission; it is not a substitute for student authorship. No human gate has been approved by an agent.

| Role / real task | Access and responsibility | Evidence / current status |
|---|---|---|
| Student Executive Producer / Creative Director | Chooses product direction, reviews playable results, owns acceptance | Selected Echo Fishery/Three.js and authorized implementation in this chat; personal reflection pending |
| Root implementation agent | Owns core rules/public contract, integration, tests and documentation | Project AGENTS.md, src/core, tests/core.test.ts, Git history and this chat |
| echo_art_direction | Read shared contract; wrote visual specification only | docs/VISUAL-DIRECTION.md; completed |
| echo_renderer | Owns renderer/input/HUD/audio; no hidden state | src/renderer and main/style; docs/UI-NOTES.md |
| echo_runner | Owns public-only baseline/model/runner and mocked transport tests | src/players, src/runner, tests/runner.test.ts, docs/RUNNER.md |
| Reusable game-contract-check skill | Inspects timing, projection parity, deterministic replay and bounded execution | .agents/skills/game-contract-check/SKILL.md; named independent task invocations in docs/skill-use-runner.md and docs/UI-NOTES.md |
| echo_independent_review | Fresh context, read-only; did not implement reviewed core | docs/review.md will record returned findings and repairs; no authority to approve/merge |

Pre-implementation gameplay/technical/evaluation design reviews occurred in separate read-only tasks. Those are design reviews, not independent code review. Live player policies are separate from the building agents and have no repository tools or source access. Student decisions, actual peer observations, live results and recording status are maintained separately; missing evidence stays pending.

Student decisions to fill in after play: Which acoustic/risk choices did you accept or reject, and why? What did a real peer's play show? What would you change? Use your own voice and actual observations.
