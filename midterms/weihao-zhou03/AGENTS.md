# Echo Fishery project instructions

Scope: this student folder and `.github/workflows/midterm-weihao-zhou03.yml` only. The supplied revised midterm permits original games; older starter references to mandatory reconstruction are superseded by the user's assignment PDF.

The student is Executive Producer/Creative Director. Do not approve gates or merge for them. Root agent owns `src/core` and the shared contract. Renderer owns `src/renderer`, `src/main.ts`, `src/style.css`, and `index.html`. Runner agent owns `src/runner`, `src/players`, and runner tests. Coordinate interface changes instead of duplicating rules.

Use project-local `docs/RULES-SOURCE-MAP.md` for original `design` rules. Follow the repository rule-change workflow: rule map first, meaningful failing test before engine change, implementation, tests, independent read-only review. Do not alter the shared starter map/engine.

No renderer or player receives private state. UI, meaningful audio, baseline and model consume PublicObservation. One action advances one tick; animation time and API latency do not advance it. Never fabricate live trials, human playtests, review findings or student decisions. Use `npm test`, `npm run check`, `npm run build` here. Live calls are opt-in, bounded, and must keep credentials outside source, browser and traces.

Reusable skill: explicitly invoke `$game-contract-check` from `.agents/skills/game-contract-check/SKILL.md` in separate real tasks; record what was checked. Independent reviewer must not have written the reviewed code and must not edit it.
