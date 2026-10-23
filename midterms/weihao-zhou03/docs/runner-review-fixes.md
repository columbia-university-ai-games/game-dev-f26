# Independent runner review fixes

This is the implementer's response to actual independent review findings, not a self-approval. Applied `$game-contract-check` again and read the root `.claude/skills/rule-change/SKILL.md` before editing. Existing source-map rules used: R8 `design` (previously announced fixed attack corridor), R10 `design` (explicit return banks cargo), R12 `design` (shared public replay), R13 `design` (runtime limits counted outside world time). The policy/replay fixes do not change the engine, legal action set, observations, or these evidence labels.

## Red phase, before implementation changes

Added three regression tests to `tests/runner.test.ts`, then actually ran `npx tsx --test tests/runner.test.ts`. Result: 7 passed, 3 failed.

1. `baseline escapes an announced harbor corridor before banking quota cargo`: public harbor fixture with hull1, quota cargo2, corridor `(19,54) -> (8,54)`, half-width3.5, safe legal `move:N:rush`. Expected move; actual `return`.
2. `replay rejects fabricated runner stops after a real terminal return`: real A/101 baseline trace was changed to claim `step_limit`/`runner_limit` despite ending by return before maxSteps100. Expected rejected; actual `verified: true`.
3. `replay enforces actual nonterminal stop boundary and summary metadata`: real one-step limit trace had its maxSteps changed from1 to100. Expected rejected; actual `verified: true`. The test also covers changed summary counts/identity, to be reached after this first failing assertion is fixed.

No live calls or held-out cases were used in the red phase.

## Implementation and green phase

`baseline.ts` now evaluates an already announced corridor before deciding to return. The model's static public rules state that return resolves an existing attack before cargo is banked; harbor grants no immunity. `episode.ts` derives runner stop from the actual engine terminal state, attempt/invalid counts and call budget. It rejects steps after terminal/limits and incomplete traces without a reached limit, checks call numbering/usage and player-source consistency, then recomputes all result summary fields. It never accepts `runnerStop` as evidence of its own correctness. Returned outcome and final observation are copied independently.

Actual first green command: `npm test` passed26/26; `npm run check` passed. The mocked HTTP-error/budget trace is also required to replay successfully, so validation does not simply reject every model stop.

## Development-only baseline refinements

Inspection of the actual development B/202 public trace found two additional policy weaknesses: initial strong discovery scattered a near fish school; a safe finishing strong reel was overridden by the generic tension/slack threshold. Added two tests before changes and ran `npx tsx --test tests/runner.test.ts`:10 passed,2 failed, with actual `ping:strong` instead of expected initial `ping:weak`, and actual `reel:slack` instead of expected safe `reel:strong`. The policy now starts with weak discovery, escalates after an empty weak sweep when no danger warning exists, and takes a safe immediate catch before generic slack recovery.

Final versions: baseline `echo-window-4`, model static prompt `echo-public-player-2`. Actual final verification: `npm test` passed28/28; `npm run check` passed. No further policy tuning is planned before the registered held-out trials. Latest actual dev results:

| Case | Outcome | Actions | Delivered value |
|---|---|---|---|
| A/101 | returned, quota met |25|24|
| B/202 | returned, quota not met (no fish) |73|0|
| C/303 | returned, quota met |40|34|

All had0 rejected actions and0 model calls. Files are `eval/runs/dev/2026-10-23T03-25-02-534Z-baseline-*`. B remains a documented baseline failure; it was not silently removed or replaced. These policy tests and deterministic trials are not live-model evidence or human playtests. Independent recheck belongs to the reviewer; no gate has been approved by this implementation agent.

Boundary effects: none on the player's public information or legal actions. Assumptions: replay validates consistency of recorded actions, public states, stop boundaries and metadata; it is not cryptographic proof that a remote provider generated an action or usage report. Provider receipt authenticity and human experience require separate evidence.
