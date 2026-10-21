AI-use disclosure: On October 21, 2026, Codex read the revised assignment and repository evidence and prepared this implementation plan under the student's direction. Planned runs, peer observations and student judgments are not completed evidence.

# Catacomb II completion plan

Plan date: **October 21, 2026, America/New_York**. Primary authority: [assignment 1749857, revised October 21](https://courseworks2.columbia.edu/courses/258228/assignments/1749857). The final deadline is **November 7 at 11:59 p.m.** The nearest checkpoint is **October 26**. Dates below are work targets unless explicitly identified as course deadlines.

## Decision and changes to the previous plan

Keep **Catacomb II, original level 1, adapted from CatacombSDL**. The updated brief permits this design and starting point. An original game, more levels, new NPCs, a different engine, and a browser rewrite are unnecessary. The existing browser transport can remain a playtest aid. The optional contest remains outside scope.

| Topic | October 21 requirement and project response |
| --- | --- |
| Destination | One PR to `columbia-university-ai-games/game-dev-f26`, base `main`; complete project under `midterms/demonrain7/`. The private development repository is retained as history, not the hand-in. |
| CI | One course-root workflow, `.github/workflows/midterm-demonrain7.yml`, filtered to our folder and workflow, with commands scoped to our project. No credentials or live calls in CI. |
| Submitted link/version | Submit the course PR URL on CourseWorks. The last push before the deadline determines the graded version. A personal repo, tag or ZIP link does not satisfy this. Staff merge; merge before the deadline is unnecessary. |
| Access/tracking | Course-repository access replaces invitations to the private repo. No midterm Asana links are required. |
| Evidence labels | Use `design` for intentional wrapper/evaluation adaptations and link their specification/rationale. `assumed` means an unverified source-game inference. |
| Human work | Partner notes by November 6. Recording assignments arrive November 9; three responses are due before class November 16. Missing received notes do not penalize us if documented as directed; notes we give are still required. |
| Size/originality | A small complete reconstruction can earn full credit. More scope or an original game earns no automatic bonus. |

The expanded vocabulary still has older Asana/scope text, and the attached Canvas rubric still mentions a tag. The explicit revised **Required hand-in steps**, also repeated in the TL;DR and assignment header, govern this plan. Preserve old tags as history; do not use one as the submitted link.

## Starting evidence and actual gaps

Inspected starting revision: `9cd4650`. No new live-model trial was run during this planning audit.

| Area | Verified existing evidence | Work still needed |
| --- | --- | --- |
| Engine | Native C/SDL2 game, original rule tests, debug-disabled 303-action level exit replay | Preserve behavior; verify relocated build and receiving-machine play |
| Interface | Pixels/HUD, status/ticks, strict controls, headless execution and bounded runner | Explicit five-operation contract, situation reset/preparation and outcome scoring |
| Players | Visual heuristic plus Vertex current/history adapters, offline failure tests | Credible baseline behavior on development cases and successful real model episodes |
| Evaluation | Five actual baseline runs from one start, zero clears; failed authentication and unattempted model conditions recorded | Three distinct situations, holdouts, matched repeated trials, complete metrics |
| Production | Implementation instructions, reusable validation skill, independent review with corrected findings, private PR history | Accessible session evidence, two evidenced named skill invocations, review of new changes |
| Delivery | Source-linked Windows candidate and earlier green hosted CI | Course-folder source, folder-specific CI, fresh-clone run, public-safe evidence, final recording and PR |
| Human evidence | Playtest protocol and agent-prepared factual inventory | Actual partner exchange, student's decisions/limitations, final one-page log |

The acceptance route is a privileged test fixture, not our baseline. Different policy seeds do not constitute distinct starting situations. An implemented model adapter is not evidence that a model has played.

## Sequence, owners and completion gates

The student remains the project owner. Codex may implement and validate authorized engineering work. Human play, interpretation, account interaction when required and final claims remain with the student. Independent review must be performed by a different session that did not implement the reviewed changes.

| Phase / target | Work and artifacts | Completion gate |
| --- | --- | --- |
| P0 — October 21 | Reconcile requirements, update active docs, prepare course CI template and this plan | Destination, dates, evidence labels and remaining work agree; old results remain intact |
| P1 — October 22–23 | Declare versioned situations; implement reset/preparation and five-operation equivalents | Three reproducible distinct starts/tasks, held-out split, bounded budgets and leakage/terminal tests; declaration committed before further policy tuning |
| P2 — October 23–25 | Improve baseline only on development cases; restore existing Vertex access; run a bounded live pilot | Baseline completes a bounded episode with purposeful behavior; at least one real model episode and trace; initial table, failures included |
| P3 — October 24–25 | Prepare isolated course checkout, move the complete permitted source/evidence into our folder, add course CI | Diff is restricted to our folder plus one workflow; fresh-clone deterministic checks pass; one reviewable course PR exists |
| Checkpoint — October 26 | Demonstrate engine/interface, baseline episode, one live model episode, initial comparison and green CI | Actual artifacts shown; incomplete items stated plainly, not relabeled as successes |
| P4 — October 27–November 1 | Freeze player/config versions; run matched final suite and current/history comparison | Normally 18 episodes: 6 baseline + 6 current + 6 history, with all attempted/failed/unattempted cases and budgets accounted for |
| P5 — November 2–6 | Student plays partner game for 15 minutes; exchange notes; fix observed problems; independent review; write personal judgment | Notes given by November 6, received notes or documented absence, linked decisions/regressions, final student-authored log/limitations |
| P6 — November 5–7 | Fresh-clone rehearsal, 3–5 minute autonomous-player recording, final evidence/link audit | Commands work at submitted course commit; all five CI categories green; required PR links accessible; completed PR URL submitted before deadline |
| Follow-up — November 9–16 | Receive assigned recordings on November 9; inspect three and write silent-playtester responses | One concrete guess and one resolving question per recording, before class November 16 |

P1/P2 are the immediate engineering path. Source migration and resource-access work can progress while provider access is unresolved. Human scheduling and publication checks should start early rather than waiting for the final experiment.

## Commit and checkpoint workflow

Use small, meaningful commits throughout implementation, rather than waiting for the entire project to be complete. These engineering checkpoints are our internal progress records; they do not create additional course deadlines or submissions.

For each coherent increment: implement or declare the work, run the relevant checks, update its evidence/status, commit with a concise English message, and push the working branch. A phase can contain several commits. Do not combine the case declaration with later tuning: the declaration must be dated and committed first. A failed live trial is still useful evidence to preserve, clearly labeled as a failure.

| Increment | Example commit message | Evidence to retain |
| --- | --- | --- |
| Case declaration | `Declare three evaluation situations and held-out cases` | Manifest, rationale, budgets and pre-tuning revision; implementation status explicit |
| Interface support | `Add reproducible situation resets and outcome reporting` | Focused reset, leakage, invalid-action and termination checks |
| Baseline work | `Improve visual navigation on development cases` | Development-case behavior and relevant regression checks |
| Live pilot | `Record the first live model episode and initial comparison` | Actual trace, outcome, failures, usage/cost and exact source/config versions |
| Course migration | `Add Catacomb II midterm source and scoped CI` | Complete permitted student folder, allowed diff, fresh-clone checks and course CI |
| Final experiment | `Record matched baseline and model evaluation results` | Frozen cases/configuration, all trial outcomes and complete metrics |
| Peer/release work | `Document peer findings and final submission evidence` | Actual observations, decisions/fixes, student log, recording and final checks |

Use the current private development branch/PR while preparing the permitted course export. Once migrated, make the course branch the source of truth for submission work and keep updating **one course Draft PR**. Every push updates that PR automatically; no separate course PR is needed per checkpoint. Record the originating development revision when migrating, and preserve inspectable inherited-versus-added source evidence without importing unrelated repository history.

Each status distinguishes **implemented**, **locally verified**, **hosted CI passed**, and **human/live evidence pending**. A commit alone does not establish that its checkpoint is complete. Keep test/run evidence tied to the exact relevant revision, and do not label queued CI as passed. Use follow-up commits for corrections, preserve frozen experiment evidence, and never force-push after the deadline. Do not add `Co-Authored-By` or AI attribution to commit messages.

## P1: situations and interface

Create `config/situations-v2.json` and a separate final player configuration; keep `config/midterm.json` and its old results reproducible. The manifest must record a date, version, source/resource hashes, case IDs, preparation, public task instructions, outcomes, allowed actions, limits and development/held-out designation.

The case declaration was committed as `b68a641` before implementation/tuning. Exact prefixes, hashes and limits are in [SITUATIONS.md](SITUATIONS.md). The adapter and reset/terminal tests are implemented; hosted course CI and live trials have separate gates. The original planning rationale follows:

| Case | Starting situation and question | Use |
| --- | --- | --- |
| S1 | Original fresh level-one start: can the policy navigate and make progress toward an exit? | Development/calibration |
| S2 | A reachable level-one combat/resource situation: can the policy manage visible threats and preserve progress? | Held out from policy/prompt tuning |
| S3 | A different reachable level-one door/navigation situation: can it choose useful movement and exit-directed actions? | Held out from policy/prompt tuning |

Choose exact reachable starts and measurable outcomes from engine evidence before tuning. Prefer the same original exit objective with different remaining challenges; if a shorter task-specific objective is needed, specify it as an evaluator design choice before any comparison. Never present a subtask completion as a full-level clear. A case must be informative within its budget; extra seeds are not a substitute for a distinct task.

Prepare a checkpoint start by replaying ordinary legal controls from a fresh process. Do not teleport, replenish resources, freeze enemies or modify native rules. Every policy receives the same prepared state and starts with empty policy history. Preparation routes, internal state and future answers stay in the trusted evaluator, not in player prompts. Log preparation actions/ticks separately and apply the declared player tick allowance after preparation. Validate reproducibility before freezing; do not tune on held-out player outcomes. All cases share a known map, so no unseen-map generalization claim is justified.

Document or implement the five operations:

| Operation | Catacomb contract |
| --- | --- |
| `reset(seed, case)` equivalent | Evaluator starts a fresh process, prepares the declared case and clears policy memory. Explain that the map is fixed and the seed controls policy randomness, not map generation. |
| `observe(player_id)` | Current PNG/HUD plus documented metadata, with no hidden coordinates, map or object state; observation does not advance time. |
| `legal_actions(player_id)` | Static control schema with direction, fire, strafe, one consumable and 1–32 ticks. No map-dependent hints; empty-inventory attempts follow original behavior. |
| `step(player_id, action)` | Validate the entire action, then advance bounded native ticks. Invalid input leaves state/ticks unchanged; post-terminal steps fail. |
| `outcome()` | Ongoing or terminal, explicit reason and a documented task score. Keep native score, level clear, task completion and truncation distinct. Do not add hidden evaluator measurements to the playing context. |

Focused acceptance checks: same case preparation produces the same state/observation; cases are genuinely distinct; history and budgets reset; preparation is not charged as a player choice; observe/invalid input do not step; state/route fields cannot leak; exit/death/cap and post-terminal behavior remain correct.

## P2/P4: credible and affordable player comparison

Keep one live provider, the already configured Vertex adapter, unless access makes a documented change necessary. Recheck its current model availability and dated published prices before spending; do not silently switch providers. The previous image trial failed reauthentication. An authentication refresh is not a successful game trial.

Diagnose baseline failures using development traces: distinguish perception errors, motion estimates, repeated turns, navigation and action duration. Improve its screenshot-based policy on S1 only. Do not import the privileged acceptance route, map coordinates or evaluator state. A credible baseline does not have to beat the model, but it must attempt the actual task competently enough for the comparison to mean something.

Use `baseline`, `current` and `history` on identical cases with identical game controls and declared simulation limits. The model ablation changes only the last three permitted observation/action/intent records. Keep model, prompt, sampling settings and action schema fixed. Record the baseline's own navigation memory rather than claiming it is memoryless. Counterbalance current/history order and use two recorded trials per case and condition. Preserve pre-freeze pilot results separately.

**Budget proposal, to encode before live runs:** retain a cumulative estimated ceiling of **$3**, including the existing **$0.0111104** unknown-use reservation. Allocate at most $0.30 to the initial live pilot and at most $0.20 to each of twelve final model episodes ($2.40 total), leaving about $0.2889 for diagnosis or an extra demonstration. These are maximum allocations, not predicted spending or a provider billing cap. Retain actual/unknown cost from every failure. `config/midterm-v2.json` now enforces $0.20 per episode and the $3 suite ceiling with the prior reservation. The separate pilot allocation and additional spending must be recorded before use; the old configuration remains historical. Do not silently exceed the cumulative ceiling.

Freeze action/tick/call/token/time/request limits in the new config after inexpensive development calibration and before held-out runs. Retain failure handling: malformed output consumes a call, not a game action; provider errors/timeouts stop; no unreported retries or fallback policy. If limits make the suite uninformative, revise and date the protocol before evaluating, or request an instructor-agreed reduced suite. A truncated episode counts as such, never as a win.

`EVALUATION.md` must show per-case/trial records and condition totals, including:

- Case, development/held-out status, trial, seed, policy, model identifier, prompt/config hash, engine and resource version.
- Attempted status, level/task outcomes, termination reason, declared score and success denominator.
- Actions, simulation ticks, model calls, illegal outputs, enforced limits and any labeled fallback (currently none).
- Latency, token usage, estimated cost and dated price source, including failed/unknown-use requests.
- Trace links, relevant CI run/commit, peer-linked limitations and results interpreted in either direction.

Do not collapse all cases into one win rate or claim statistical certainty. Changing screenshot hashes are not explored-area measurements. The experiment measures behavior, not training or learning.

## P3: course repository and publication

The existing `game-dev-f26` checkout has unrelated uncommitted changes. Use an isolated checkout/worktree from current course `main`; preserve that work. Create a branch such as `demonrain7/midterm`. Keep one course PR throughout completion; the private development PRs are historical evidence.

Target layout:

```text
game-dev-f26/
  .github/workflows/midterm-demonrain7.yml
  midterms/demonrain7/
    README.md
    EVALUATION.md
    AGENT-TEAM.md
    AGENTS.md
    COPYING
    .gitignore
    .gitattributes
    CMakeLists.txt, CMake/, native C/H sources
    pyproject.toml, uv.lock
    scripts/, tests/, web/, config/, prompts/, skills/
    docs/                         # rule map, evidence, anonymous peer notes
```

The workflow template is [delivery/midterm-demonrain7.yml](../delivery/midterm-demonrain7.yml). It is now installed as the permitted course-root workflow; hosted execution is recorded separately after the PR opens. All dependency manifests stay in the student folder. Do not edit root shared manifests, `.gitignore`, page code or other students' folders. Keep `.claude/` ignored inside our folder without changing the course-root ignore file.

Publish only reviewed tracked source and permitted evidence. Exclude `.git`, installed dependencies, local environments, caches, binaries, original `.CA2` data, raw runtime image directories, credentials, access fragments and identifying peer notes. Preserve upstream licensing/credits and give an inspectable original-vs-added source record; private PR URLs alone do not provide staff access to that history. Carry a sanitized implementation/review record into the course folder. Do not publish the entire conversation as a shortcut to session evidence.

The code's GPL terms and original data's terms are separate. Establish a lawful resource acquisition route that a TA can actually follow, then test it from a fresh clone. Hashes and an archive URL establish provenance, not publication permission. If reuse/publication terms remain unclear, prepare the exact files, terms and question for the instructor to resolve before release. Do not silently replace the game's art, level or mechanics to solve the delivery issue. This is an early delivery dependency, not a reason to abandon the chosen game now.

Migration checks must also inspect project-root assumptions. In particular, `scripts/package_release.py` currently archives repository `HEAD`; inside the course monorepo, any future package must select only our project subtree. Its optional ZIP/release workflow must not export classmates' work. Keep evaluation fingerprints scoped to the project while recording the actual course commit. Recheck links, launchers and paths from `midterms/demonrain7/`.

## CI, review and human evidence

The course workflow must prove our game's checks, not just pass the starter suite:

| Required check kind | Existing foundation and extension |
| --- | --- |
| Rule invariants | `tests/test_game_rules.c`: collision, inventory, doors, charging, damage, spells and boundaries |
| Legal/illegal actions | `tests/test_agent_protocol.c`, `tests/test_interface.py`, player contract tests; add situation-boundary cases |
| Terminal path/outcome | Native exit/death fixtures and runner terminal tests; original-resource full-level replay stays a separate local integration check |
| Observed regression | Windows resource/argument/warp bugs; lost short web taps; independently reproduced reporting failures, with provenance retained |
| Episode limits | `tests/test_players.py` and evaluation tests; add post-preparation accounting, call/time/token/cost and stopped-suite records |

No real API calls or private data in hosted CI. Add focused tests for changed behavior; do not rerun unrelated expensive checks without reason. After player/evaluator/migration changes, request an independent read-only review at a pinned revision and record findings and fixes. The older review remains evidence of its own revision, not approval of new work.

Use the named `catacomb-validation` skill in real work sessions and retain evidence of at least two invocations. Link implementation session/task evidence and independent review from the course PR. A summary invented afterward is not a session transcript. The student writes/revises the one-page `AGENT-TEAM.md` and the limitations using actual recommendations, decisions and evidence.

For peer work, provide a player-only build, keep debug controls/solutions separate, and gather anonymous observations. The student must also actually play a classmate's game for fifteen minutes and give notes by November 6. If received notes do not arrive, state that accurately; the brief then assesses this part from the notes given. Use actual findings to justify a fix or a deliberate decision to retain behavior.

## P6: final rehearsal and hand-in

1. From a fresh course clone, enter `midterms/demonrain7/` and follow README setup, play, test, baseline and model commands using separately authorized resources/credentials. Validate on the student's Mac as well as the existing Windows path; hosted macOS tests do not establish interactive Mac play.
2. Produce a 3–5 minute recording showing actual model-selected/submitted actions without a human choosing moves. Explain scope, reuse, interface, comparison, failure/limits and one human decision. A failed episode is acceptable when honestly explained. The fixed acceptance clip is not the model demonstration.
3. Put README, evaluation, final agent-team log, given/received peer notes and recording links in the course PR description. Verify staff and assigned peers can access the recording/evidence; a personal private-repo link is insufficient. Keep raw personal feedback private as directed.
4. Verify the PR diff boundary, clean reproducible commands, all five CI check kinds, source terms, trace completeness and absence of secrets/data/caches. Ensure the submitted commit corresponds to the results; if behavior changes after evaluation, rerun affected comparisons as a new version.
5. Push the complete submission before **November 7, 11:59 p.m. New York time**, then submit the course PR URL in CourseWorks and inspect the receipt. Target November 6 for completion and use November 7 as a buffer. Staff handle merging.
6. Preserve the submitted history. Never force-push after the deadline. Later corrective pushes are not automatically graded; explicitly requesting a later version invokes the assignment's late policy for the whole submission.

## Risk response and scope cuts

| Risk | Response / retained boundary |
| --- | --- |
| Provider sign-in unavailable | Continue offline interface/migration work; resolve the existing login early; retain failed evidence. A reduced live suite requires instructor agreement, not silent substitution. |
| Asset terms or TA access unresolved | Prioritize provenance/permission/acquisition verification; seek a concrete instructor decision if needed. Do not publish unverified original data. |
| Weak baseline or all episodes hit limits | Diagnose development-case behavior and budget before freezing; distinguish poor play from an uninformative test design. |
| Course migration breaks paths | Build/test from the nested folder in an isolated clean checkout and review package scope. |
| Insufficient time | Cut extra levels, new NPCs, new art/UI, new providers, optional contest, persistent memory and extra deployment work first. Keep the complete core loop, real player, baseline, fair suite, CI and required human evidence. |
| Missing partner response | Record notes given and missing received notes by the specified date; follow the brief's exception. Do not fabricate feedback. |

Next implementation unit: **P2, development-case baseline calibration and a real model pilot**. P1 is implemented and locally verified; finish the P3 course CI/resource-access gates alongside P2. No new NPC behavior or gameplay redesign is part of this plan.
