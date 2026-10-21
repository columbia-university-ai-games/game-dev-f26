# Situation interface checkpoint — October 21, 2026

Implementation session: the student requested the next planned checkpoint and
a preliminary course PR in the existing Catacomb project conversation. Codex
used the `catacomb-validation` skill by name, then followed the course
`rule-change` workflow for observation/outcome changes. This is engineering
evidence, not student reflection, peer testimony or a live model result.

## Change submitted for independent review

1. **Rule / evidence:** the `design` row in `docs/RULE_SOURCE_MAP.md`, D5 in
   `docs/DESIGN_SPEC.md` and `config/situations-v2.json` define ordinary-control
   prefixes, relative player time and binary level-exit score. Declaration
   commit `b68a641` precedes implementation and any new policy tuning. Native
   mechanics, resource files and player policy/prompt are unchanged.
2. **Test first:** `tests/test_players_situations.py` initially failed with
   `ModuleNotFoundError: No module named 'situation_env'`, before the adapter
   existed. Six initial tests then passed. Additional runner and native checks
   cover invalid-output history, true clear/death, matched case scheduling and
   actual prepared starts. A subtree packaging regression also failed before
   its implementation; an intermediate empty-archive defect was found and fixed.
3. **Boundary:** the first request receives only the prepared screenshot,
   running status, relative tick 0 and dimensions. Preparation route/state,
   case split and resource paths remain in the trusted harness. No new remote
   tools. Invalid actions do not step; preparation is not a player action or
   history item. This is API separation, not an OS sandbox for arbitrary code.
4. **Assumptions / limits:** same original map for all starts; seeds vary policy
   behavior, not maps. A privileged route establishes reachability, not player
   competence. Held-out cases are used for reset/contract checks only at this
   checkpoint. No new paid requests, no human playtest and no claim of successful
   live-model play. New monetary settings are preflight; verify pricing/access
   and carry all later spending before live runs.

## Validation record

- Windows, headless SDL, locally held original resources: four SHA-256 hashes
  matched `config/resources.json`.
- Offline player/evaluation tests: 30 passed, including eight situation tests.
- Release tests: five passed, including a temporary monorepo test proving that
  packaging exports only the project subtree.
- Real-resource integration: all eight tests passed in 144.435 seconds. Each
  declared start reproduced twice; observe/invalid calls preserved it, a full
  post-preparation tick budget remained available, and the door-start suffix
  reached the original exit in 39 actions / 83 player ticks.
- Windows Debug build: unchanged native targets built successfully; four
  asset-free CTest groups passed. The already-completed resource tests were
  excluded from this second invocation. `uv sync --frozen` passed.
- Independent read-only review: no blocking/should-fix findings; stale status
  text noted and corrected. See [review report](independent-review-20261021.md).
- Fresh course-folder build and hosted CI: pending; results will be appended
  when completed.

## Portability regression found during course import

The first clean source export exposed a real reset failure: the route pin
hashed working-tree bytes, while Git normalized its trailing CRLF to LF. Two
offline tests failed in the exported folder. A new LF/CRLF regression reproduced
the failure before the fix. The route now uses canonical JSON hashing, and
changed action content still fails verification. The action sequence, prefix
lengths, starting images, resource hashes and task budgets did not change.
Nine focused situation tests passed after the correction. This defect was found
by migration validation, not by the earlier source-only review.

The complete course assignment still requires the actual model pilot, matched
live comparisons, peer exchange, student's final log and 3–5 minute recording.

## Course-folder verification

The permitted source was exported into an isolated course checkout, preserving
unrelated edits in the existing main checkout. The fresh nested-folder Windows
Debug build completed and all four CTest groups passed. After the hash fix,
all 31 player/evaluation tests passed in its separately installed locked uv
environment. Independent follow-up found no issue with the canonical-pin fix.
No original resources, binaries, dependency caches, private tunnel links or
credential-pattern matches were included in the export. Hosted course CI is
recorded after the Draft PR exists; it is not implied by these local checks.
