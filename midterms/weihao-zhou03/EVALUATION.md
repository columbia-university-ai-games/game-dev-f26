# Evaluation — working draft

Status: development evidence collected; frozen held-out comparison pending. No human playtest, course CI, or final recording claim is made here until links/results exist.

## Predeclared design

`eval/suite.json` was written before the first engine and player prompt. Development cases A101/B202/C303 are used for debugging and baseline development. Reserved evaluation cases A711/B823/C947 will be run twice per model condition (current-only and six-public-step history), giving12 fresh model episodes. Deterministic baseline runs use the same cases. Independent repetitions do not imply statistical certainty; no superiority is pre-assumed. Rules/config/prompt/model settings must be frozen before exposing reserved cases.

Primary: task completed AND returned. Also report returned/partial cargo, delivered value, hull, action count, illegal actions, calls/failures/fallbacks, latency, tokens and dated cost/provenance. API latency never consumes the game's night budget.

## Development live evidence

Actual gateway: local OpenAI-compatible HTTP service selected by user; requested model `gpt-6.1-sol`. Credentials were supplied only in the CLI process environment and were never serialized. A4-call smoke test produced4 valid model moves and intentionally stopped at call budget, with0 fallback; this was a connectivity/limit diagnostic. A subsequent complete A101 trial returned2 silver-bell fish in15 steps,15 calls,0 failed calls/fallbacks,24 cargo value (64 score with mission bonus),19,167 input and481 output tokens,58,005 ms accumulated request latency. Source of playable recorded demonstration: `public/model-demo.json`.

These are real development requests, not mock/replay. They are not held-out claims and were collected before final prompt/runner revisions. Monetary cost is **unknown**: the gateway uses the user's configured subscription access; no verified per-token tariff or quota cost is available. Unknown is not zero. Model identity is the requested/reported gateway identifier, not an independently attested upstream snapshot.

## Deterministic checks

Core coverage includes fixed ticks, pure observation, rejected actions, swept collision, snapshot aging, beacon timing, actual acoustic trajectory changes, persistent sound investigation, current-cue reeling, fixed announced attack/evade, no instant warning damage, delivery/expiry priority and hidden-state projection parity. Runner coverage includes strict JSON, fresh/bounded contexts, HTTP/timeout/repair budgets, labeled fallbacks and replay. See `docs/review.md` for observed issues and test-first fixes. Final check counts/CI link will be added after freeze.

## Limitations and human authorship

Current implementation is not validated as fun by humans. Peer notes and student reflection remain pending, with no fabricated testers, quotations or acceptance. Continuous planar sound uses a game approximation, not realistic underwater acoustics; reefs constrain navigation but do not occlude sound. Three behaviors/presets provide a bounded experience, not a large content library. Small live samples measure these cases and this configuration only. The student must replace/supplement this factual limitations paragraph with their own decisions and actual peer observations for the course authorship requirement.
