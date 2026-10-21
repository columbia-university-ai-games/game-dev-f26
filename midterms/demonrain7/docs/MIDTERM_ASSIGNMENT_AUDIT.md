AI-use disclosure: Codex read the live assignment and repository evidence on October 21, 2026 and updated this audit. Recommendations are proposals, not student-authored reflection or completed experiments.

# Midterm assignment audit — October 21, 2026

The live [assignment](https://courseworks2.columbia.edu/courses/258228/assignments/1749857) is now marked **Revised October 21, 2026**. The deadline remains **November 7, 11:59 p.m. America/New_York**. The current source inspected is `9cd4650`. Keep **Catacomb II level 1 adapted from CatacombSDL**; the design and implementation route remain eligible, and no new game or gameplay redesign is required.

| Changed requirement | Current action |
| --- | --- |
| One course-repository PR, complete source | Put the project in `game-dev-f26/midterms/demonrain7/`, with one workflow `.github/workflows/midterm-demonrain7.yml`; target `main` |
| PR URL is the hand-in | Submit the course PR URL, not the private repo, a tag, an archive or a link-only folder |
| Shared staff access; no midterm Asana | Remove personal-repo staff invitations and Asana links from the required path |
| Last pre-deadline push determines version | Preserve the GitHub timeline; staff merge; no force-push after the deadline |
| `design` evidence label | Label intentional adaptations with a specification and reason; `assumed` remains an unverified source-game inference |
| Later recording feedback | Assignments November 9; three replies before class November 16 |
| Missing received notes exception | Disclose absence by November 6; assessment uses the notes given without penalizing the recipient |

The expanded vocabulary still contains older Asana/scope text and the attached rubric still mentions a tag. The explicit updated **Required hand-in steps**, TL;DR and header agree on the course PR route; they govern the current plan.

Use [MIDTERM_PLAN.md](MIDTERM_PLAN.md) for the complete P0–P6 plan, phase dates, case design, budget, CI mapping, public-delivery checks and human responsibilities. [SUBMISSION.md](SUBMISSION.md) is the current hand-in checklist. The main technical gaps remain real distinct cases, a credible baseline/live pilot, matched repeated trials and actual peer/student evidence. New course-folder CI and lawful original-resource access are delivery dependencies. The prepared workflow template has not yet run in the course repository.

## Historical October 19 audit — superseded where noted

The following preserves the earlier audit. Its old tag, personal-repo access, Asana and November 9 hand-in statements are **not current instructions**; the October 21 section and linked completion plan above replace them. Recorded experiments and earlier rubric gaps remain evidence of that earlier state.

## Sources and decision

The [midterm assignment](https://courseworks2.columbia.edu/courses/258228/assignments/1749857), revised October 18, sets the final deadline to **November 7, 2026, 11:59 p.m. America/New_York**. Its Canvas due field agrees. The [syllabus](https://courseworks2.columbia.edu/courses/258228/assignments/syllabus#midterm) still contains the older October 26 schedule and Session 2 scope wording; its generated assignment summary already lists November 7. Use the newer assignment's specific midterm dates and procedures, with the syllabus's assessment and course policies. Modules currently exposes Sessions 1–5.

**Keep this repository and the attributed CatacombSDL implementation.** Modifying a permitted existing codebase is the assignment's recommended route. The student's September 26, 4:29 p.m. [Week 3 post](https://courseworks2.columbia.edu/courses/258228/discussion_topics/1669984) names Catacomb II/CatacombSDL, one early level, original movement/combat/doors, death or exit, and screen/controller access only. Original level 1 implements that boundary. The new brief identifies the Week 3 header as the scope record of origin. No separate instructor approval is claimed; missing proof of such approval is not treated as a new prerequisite to continue this matching scope.

Inspected code revision: `1d2e626`. This audit changes documentation only. Existing tests, review, traces and candidate packages remain useful evidence. A new repository would not address the outstanding experiment, authorship or resource-access issues and would make the history harder to follow.

## Dates and submission

| Date, 2026 | Meaning in the revised brief |
| --- | --- |
| October 19 | Formative checkpoint: route, bounded scope, three-situation suite, interface work, source map and reuse terms |
| October 26 | Formative checkpoint: five interface operations or equivalents, baseline episode, one live model episode/trace, initial table and green deterministic CI |
| Week of November 2; notes by November 6 | Fifteen-minute playtest of a classmate's build; give partner notes and obtain notes on this build |
| November 7, 11:59 p.m. | Submit the repository tag URL and 3–5 minute recording together through the midterm CourseWorks entry |
| Before class November 9 | Three assigned recording responses: identify one guess and ask the question that removes it |

Checkpoints have no separate grade. They still document work order; declare the suite before tuning. November 6 notes and November 9 responses remain course activities even though November 7 is the final project deadline.

The repository must have a tag named exactly `midterm`, root `README.md` with setup/play/evaluation commands, `EVALUATION.md`, and `AGENT-TEAM.md`. Include game/player/tests/configuration, traces or accessible links, peer notes received and given, and the recording link in README and CourseWorks. A private repository must include the instructor and **all three TAs** as collaborators. Asana links scope/decisions to PRs and evaluation evidence; manual links suffice.

## Rubric audit

| Check | Evidence now | Remaining correction |
| --- | --- | --- |
| 1a: labeled rule evidence | Source/manual map and rule tests | This audit adds explicit strongest-evidence labels and file/line locators; maintain coverage as rules/cases change |
| 1b: omissions/adaptations | Level 1, paused model time, tick batches, startup tick and no model audio documented | Add reasons for each exclusion/change and explicitly disclose any future checkpoint starts |
| 1c: sources/reuse | GPL source, upstream revision and notices retained; original data excluded from packages | Establish lawful, reproducible resource supply for the TA and any necessary publication permission; hashes are not permission |
| 2a: complete loop | 303-action ordinary-interface exit replay; packaged binary reproduces it | Actual peer/receiving-machine checks; automated acceptance is not enjoyment evidence |
| 2b: model player | Vertex adapter, strict runner and offline tests | No successful live image-model action yet; restore provider login and run a real pilot |
| 2c: information boundary | Allowlisted pixels/status/ticks/history; no remote tools; static action vocabulary | Preserve leakage checks for new situations and document all five equivalent operations |
| 3a: fresh-clone operation | Build/player/package instructions and extracted Windows candidate | Root README commands, both players from a fresh clone, resource handoff, final tag `midterm` |
| 3b: authoritative limits | Validated transitions; action/tick/call/time/token/cost limits; explicit failures | Apply limits consistently after situation preparation; account for preparation separately |
| 3c: CI | Native rules/protocol/terminal checks, browser regression, offline episode limits; prior CI green | Map all five required check kinds and verify them on the final tagged revision |
| 3d: agent-team evidence | Instructions, reusable skill, PRs and independent read-only review with three corrected findings | Link inspectable implementation-session evidence from PRs and document named skill use in at least two sessions |
| 4a: explained choices | Screen-only actions, visual baseline, three-frame history, source reuse | Explain alternatives and reasons for suite, stepping, baseline and memory; student owns final rationale |
| 4b: credible experiment | Heuristic baseline ran five episodes, all alive at action limit; zero clears | Diagnose navigation/budget on development cases; demonstrate meaningful baseline behavior; privileged route is not the comparator |
| 5a: fair comparison | Frozen five-seed, single-start baseline evidence and failure accounting | Three distinct situations/tasks, normally two live trials each, held-out cases, matched baseline/current/history runs and complete metrics table |
| 5b: student judgment | Agent-prepared third-person log and blank peer protocol | Student-authored/revised final log and limitations with actual decisions and peer observations; current draft is insufficient |
| 5c: recording | Outline and labeled acceptance-replay clip | 3–5 minutes of actual model-selected/submitted actions without manual move selection; explain limits and link recording |

The five old seeds change policy randomness, not the starting situation. They **do not** meet the three-situation requirement. Preserve them as preliminary evidence. Neither the API implementation nor the earlier text-only Cloud setup check proves live game-playing ability.

## Revised sequential modules

| Module | Deliverable and acceptance | Focused tests/evidence |
| --- | --- | --- |
| R0: requirements | This audit, dates/scope record, labeled rule map and todo; English GitHub checkpoint | Links, stale-date review, diff check |
| R1: cases and interface | Versioned development/held-out manifest: case IDs, preparation, goals/outcomes, limits and five operations or documented equivalents | Distinct starts/tasks; deterministic preparation; history reset; no hidden fields; invalid action leaves state unchanged |
| R2: baseline and pilot | Diagnose baseline on development cases; real image-model pilot; freeze policy/prompt/config before held-out runs | Meaningful legal behavior, observed regression, forced timeout/provider failure; retain every paid attempt |
| R3: comparison | Normally 3 situations × 2 trials × 3 policies = 18 episodes, including 12 live model episodes; matched baseline/current/history conditions | Per-case denominators, all required table fields, failed/unattempted cases, model/config/game IDs and costs |
| R4: peer evidence/authorship | Given/received peer notes, resulting fixes, student's one-page log and limitations; session/skill evidence and Asana links | Reproduce peer issues and verify fixes; templates and automated play do not substitute for observations |
| R5: delivery | Fresh-clone verification, required root files, `midterm` tag, staff access and autonomous-agent recording; submit tag URL and recording | Both players run from README; deterministic CI green on tagged revision; evidence links accessible |

**Proposed R1 design, not yet frozen or implemented:** stay within original level 1. Use the original start plus two distinct reachable situations prepared by recorded legal input prefixes, such as a combat/resource decision and a door/navigation decision. Run every policy from the same prepared state with empty memory. Keep preparation commands, internal state and the future route out of player inputs; record preparation ticks/cost separately. Validate starts without using held-out policy outcomes for tuning. Reserve at least one situation from prompt/baseline tuning and disclose that all cases share one previously inspected map. Do not claim unseen-level generalization. If cases cannot be informative and affordable, revise them before freezing or obtain an agreed reduced suite; extra policy seeds are not a substitute.

Exact prefixes, goals, budgets and the development/held-out split belong in the R1 manifest. Historical `config/midterm.json` remains runnable for reproducing the preliminary study; it is not the final protocol. Simply running its ten missing model episodes would not complete the revised assignment.

## Optional work and publication boundary

Full-game ports, new NPCs, professions and creative rewrites are optional. The requested pause before new NPC design remains. Required agent play controls the wizard through actual game actions.

The Handshake/OpenAI multiplayer contest is separate, optional and awards no midterm credit. Its [official rules, “Information Submitted,” page 3](https://go.joinhandshake.com/rs/390-ZTF-353/images/%5BAI_Skills_Studio_Challenge%5D_Contest_Official_Rules.pdf?version=0) grant broad, perpetual promotional permissions for submitted work and entrant identity. Contest entry is excluded from this plan. Course implementation/publishing authorization is not consent to those contest terms. Repository visibility stays private; staff access is a separate delivery task.
