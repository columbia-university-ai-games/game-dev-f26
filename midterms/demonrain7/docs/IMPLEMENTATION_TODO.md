AI-use disclosure: Codex maintains this checklist from the student's instructions, revised assignment and actual repository evidence.

# Midterm implementation checkpoints

Last updated: **October 21, 2026 (America/New_York)**. The [revised assignment](https://courseworks2.columbia.edu/courses/258228/assignments/1749857) requires one course-repository PR URL by **November 7 at 11:59 p.m.** Partner notes are due November 6; recording assignments arrive November 9 and three responses are due before class November 16.

Follow phases **P0–P6** in [MIDTERM_PLAN.md](MIDTERM_PLAN.md). Earlier results remain valid engineering evidence, not proof that the full assignment is complete. The private repo is development history; the complete hand-in belongs in `game-dev-f26/midterms/demonrain7/`.

## Retained engineering evidence

- [x] Original first-level core loop, central native rule fixtures and 303-action debug-disabled exit replay.
- [x] Strict visual action API, bounded Vertex adapter and screenshot-only baseline.
- [x] Current-image and bounded-history conditions; no model source/debug tools.
- [x] Action/tick/call/time/token/cost limits; failure evidence survives cleanup and accounting errors.
- [x] Five real preliminary baseline episodes and explicitly unavailable model cases.
- [x] Independent read-only review, three corrected P2 findings and focused regression checks.
- [x] Green prior hosted CI and source-linked Windows candidate, with verified packaged replay.
- [x] English code/docs and preserved upstream attribution, private credentials and ignored original data.

## P0 — Reconcile the October 21 assignment

- [x] Read the live October 21 assignment, TL;DR, hand-in steps and expanded vocabulary; verify November 7 final due date.
- [x] Locate the actual September 26 Week 3 CatacombSDL post and link the scope origin.
- [x] Keep the original level-one adapted-source route and private development history.
- [x] Add explicit rule evidence labels/locators and reasons for omissions/adaptations.
- [x] Correct course-PR delivery, peer-playtest and November 16 recording-response dates.
- [x] Remove private staff invitations, exact final tag and Asana links from midterm requirements.
- [x] Add the `design` specification and prepare the scoped course CI template.
- [x] Exclude the optional Handshake contest and its promotional-license terms.
- [x] Verify the updated documentation and workflow template: relative links, English text, YAML structure, folder filters, read-only permissions and no live calls/secrets. The planning checkpoint uses [private PR #5](https://github.com/DemonRain7/catacomb-midterm/pull/5), not the final course PR.

## P1 — Declare situations and interface (target October 22–23)

- [x] Commit a versioned manifest with at least three distinct situations/tasks, task outcomes, initial-state evidence and a development/held-out split before further policy tuning.
- [x] Prepare level-one starts using reproducible ordinary input, identically for all players, with empty episode history; separate evaluator preparation from player actions.
- [x] Document reset, observe, legal actions, step and outcome equivalents, including seeds, score/terminal reasons and fixed-step behavior.
- [x] Add focused tests for deterministic/distinct starts, history reset, hidden-state isolation, invalid actions and terminal behavior.
- [x] Declare case order and preflight budgets in `midterm-v2.json`; keep old five-seed evidence. Final policy/provider freeze remains P2/P4 work.

## P2 — Baseline and live pilot (target October 23–25)

- [ ] Diagnose baseline navigation/combat and action granularity on development cases; demonstrate purposeful progress.
- [ ] Restore the already authorized Google login and record one actual image-model episode.
- [ ] Keep every failed attempt and cost reservation; previous unknown-use reservation is $0.0111104.
- [ ] Verify malformed responses, timeouts, provider failures and actual regressions with focused tests.
- [ ] Freeze policy/prompt/configuration before held-out evaluation. Do not tune on held-out results.
- [ ] Show an actual initial comparison table, baseline episode and live model trace at the October 26 checkpoint.

## P3 — Course folder and CI (target October 24–25)

- [x] Use an isolated course checkout; preserve unrelated local edits.
- [x] Put complete permitted source and artifacts in `midterms/demonrain7/`, retaining source licensing and an inspectable changes record.
- [x] Add only `.github/workflows/midterm-demonrain7.yml` outside that folder; preserve shared configuration and classmates' files.
- [ ] Establish lawful recipient resource supply and any necessary publication permission; exclude private/identifying content and original data without permission.
- [x] Fix nested-folder and packaging assumptions; state working directories for all README commands.
- [ ] Open one course PR and verify all five deterministic CI kinds there.

## P4 — Run the comparison (target October 27–November 1)

- [ ] Run baseline, current-image model and bounded-history model on the same declared situations.
- [ ] Normally use three situations and two trials per condition: six baseline episodes and twelve live model episodes.
- [ ] Record all required table fields: outcomes, illegal actions, steps/calls and limits, latency, tokens, dated cost, trial/seed/model/config/game identifiers.
- [ ] Retain failed and unattempted cases with accurate reasons; test per-case accounting and report generation.
- [ ] Interpret both positive and negative results without learning/generalization claims unsupported by the small suite.

## P5 — Peer evidence, review and student authorship (through November 6)

- [ ] Obtain actual peer notes on this build and record the student's fifteen-minute partner play; give notes by November 6.
- [ ] If received notes are absent by November 6, disclose this and retain the notes given as the brief directs.
- [ ] Link an actual observation to a decision/change and verify any fix.
- [ ] Link inspectable implementation-session evidence from PRs and named skill use in two sessions.
- [ ] Have the student author/revise the final one-page log and limitations using actual decisions and peer evidence; the current agent-written draft is not submission-ready.
- [x] Obtain a separate read-only review of new changes and verify corrective work.

## P6 — Fresh-clone verification and final delivery (target November 6)

- [ ] Resolve lawful original-resource supply for recipients and any necessary publication permission.
- [ ] Put direct setup/play/test/evaluation commands and recording link in the course-folder README; prepare EVALUATION.md and AGENT-TEAM.md at the same folder level.
- [ ] Run both players from a fresh course clone; check the student's Mac; verify all five CI kinds at the submitted version.
- [ ] Ensure course PR artifacts, peer notes and recording are accessible to staff and assigned peers.
- [ ] Record 3–5 minutes showing actual model-selected/submitted moves without manual selection, including limits/failures.
- [ ] Finish branch pushes before the deadline; PR description links README/evaluation/team/peer/recording and names the login/title.
- [ ] Submit the course PR URL to assignment 1749857 by November 7, 11:59 p.m.; verify the receipt. Staff merge; never force-push after the deadline.
- [ ] Receive recording assignments November 9; complete three responses before class November 16.

## Deferred extensions

New NPC behavior and professions remain paused for the user's requested design discussion. They are optional and excluded from the required comparison. The Handshake contest is outside this project.

## Historical work log

These entries preserve what was known when work happened. The October 21 course-PR, no-Asana and later recording-response instructions supersede older tag/access/Asana/date statements. Recorded experimental outcomes are unchanged.

- October 19: clean `codex/week4-checkpoint` working tree; existing draft PR #1 attached. Read `skills/catacomb-validation/SKILL.md`. Syllabus still requires scope agreement, an executable model player, a meaningful baseline, repeated live trials, independent review and human participation evidence.
- M1: four CTest groups passed after adding rule checks. Full first-level discovery and ordinary-interface replay both cleared at tick 612 after 303 actions. See `docs/evidence/level1-acceptance-20261019.json`. Original-DOS equivalence and instructor agreement remain separate unresolved claims.
- M1 hosted CI: [39344534129](https://github.com/DemonRain7/catacomb-midterm/actions/runs/39344534129) passed Linux/macOS native checks and browser input regressions on commit `342bd58`.
- M2: the screenshot-only baseline completed 80 actions (tick 641) and reached its action limit. First Vertex image-player attempt stopped at tick 1 with Google's reauthentication requirement. Existing CLI credentials also need reauthentication; no saved browser password is available. Live model play remains unverified while implementation and offline checks proceed.
- User direction: push each module/checklist as a reviewable GitHub trace. Pause for discussion before implementing new NPC behavior. Existing original enemies remain in the Classic reconstruction.
- M2 hosted CI: [39345678568](https://github.com/DemonRain7/catacomb-midterm/actions/runs/39345678568) passed Linux/macOS native, browser input and nine offline player cases on `a950129`; [PR #2](https://github.com/DemonRain7/catacomb-midterm/pull/2) contains the player module.
- M3 implementation: repeated-suite runner, frozen manifest and report generator added. Twelve offline player/evaluation cases passed. Real baseline repetitions are next; unavailable model conditions will stay explicitly unattempted.
- M3 result: [baseline report](evidence/baseline-suite-20261019/REPORT.md) records five real episodes, 400 total actions, zero clears, and ten unattempted model conditions. Every baseline remained alive at the 80-action limit (tick 641). All 400 decision-frame hashes, engine/resource equality and result counts were checked. No model-playing or memory-effect conclusion is claimed.
- M3 is published as [PR #3](https://github.com/DemonRain7/catacomb-midterm/pull/3), stacked on PR #2. M4 independent review started from `fbe709e` in a fresh reviewer context; its report is pending. The peer protocol is in `PLAYTEST.md`, and the explicit proposed scope/agreement fields are in `SCOPE.md`.
- M3 hosted CI: [39346482918](https://github.com/DemonRain7/catacomb-midterm/actions/runs/39346482918) passed all four jobs on `fbe709e`.
- M4: [independent report](evidence/independent-review-20261019.md) identified three P2 reporting defects. Corrected budget-stop evidence, cleanup/result persistence and model-startup classification; environment failures retain a distinct cause. Twenty offline player/evaluation cases pass, and the independent reviewer checked the corrective delta. No new gameplay or NPC rule was added.
- M4 corrections and peer/scope documentation were pushed as `d7c8f01`. M5 adds package/resource verification and a player-only browser host. Four release regression cases, all four original-resource hashes and eight real HTTP/native integration cases passed. Asana login and staff repository access remain pending; only the owner currently appears as a collaborator.
- M5: [PR #4](https://github.com/DemonRain7/catacomb-midterm/pull/4) contains review corrections and delivery work. [CI 39348058091](https://github.com/DemonRain7/catacomb-midterm/actions/runs/39348058091) passed all four jobs for `18d53bc`.
- Candidate [midterm-v0.1.0-rc1](https://github.com/DemonRain7/catacomb-midterm/releases/tag/midterm-v0.1.0-rc1) is published from `18d53bc` with matching source/Windows ZIPs and checksums. The extracted Release executable completed the ordinary-interface route (303 actions, tick 612, Debug-matching final image). All three uploaded artifact digests matched local files. See [release evidence](evidence/release-candidate-20261019.json).
- External Chrome verified the extracted candidate's startup, movement, pause and hidden developer controls with no page errors. The restart dialog blocked browser automation, so that check remains unverified. A labeled 304-frame local clip is at `runs/presentation/classic-acceptance-replay.mp4`; its [evidence record](evidence/acceptance-clip-20261019.json) distinguishes it from live model/human play and the final presentation.
- Tracked source/document text was checked for CJK characters: none found. The one-page agent-team log is 426 words. New NPC behavior remains paused for discussion.

- Revised-assignment audit: located the November 7 submission and Week 3 scope origin; retained the mod route. The five-seed single-start study is preliminary, not a compliant three-situation suite. Required root filenames, exact final tag, two-session skill evidence, student's voice and actual peer/recording work remain tracked above. No new NPC or contest work was started.
- R0 publication: `1802d5a` and [PR #5](https://github.com/DemonRain7/catacomb-midterm/pull/5) preserve the revised requirements audit. Eighteen documentation files, 57 relative links, English text, disclosures and diff whitespace passed local checks. Runtime code/configuration and prior experiment artifacts are unchanged.
