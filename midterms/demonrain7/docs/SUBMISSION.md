AI-use disclosure: On October 21, 2026, Codex read the live revised assignment and updated this delivery checklist. No final CourseWorks submission or course-repository midterm PR was made during this audit.

# Required midterm submission

Source: [Midterm assignment, revised October 21](https://courseworks2.columbia.edu/courses/258228/assignments/1749857), especially **What you submit** and **Required hand-in steps**. Due **Saturday November 7, 2026, 11:59 p.m. America/New_York**.

## Destination and boundary

Open **one PR** to [columbia-university-ai-games/game-dev-f26](https://github.com/columbia-university-ai-games/game-dev-f26), targeting `main`. Use a branch such as `demonrain7/midterm`. Include the complete project under **`midterms/demonrain7/`** and one course-root workflow, **`.github/workflows/midterm-demonrain7.yml`**. No other shared or student files may change. Dependency manifests, configurations, ignore rules and supporting evidence belong inside our folder.

Submit the **course PR URL** in the CourseWorks URL field by the deadline. A personal-repository URL, tag URL, ZIP, or a link-only project folder does not satisfy the hand-in. The PR need not be merged before the deadline; the instructor or a TA handles merging.

The course repository is public and supplies staff access. Invitations to the personal private repository are not a midterm requirement. **Asana links are not required for the midterm**; Asana begins with the final project. These explicit instructions supersede our October 19 plan and older wording in the syllabus, vocabulary and attached rubric.

## Required folder contents

- Complete game source, executable player implementation, baseline, tests, agent configurations and permitted traces or accessible trace links.
- `README.md`: setup, play, test and evaluation commands, with every working directory stated starting from `midterms/demonrain7/`; scope, rule/source map with labels/locators, reuse terms, peer-note and recording links.
- `EVALUATION.md`: declared suite, current/history comparison, all required metrics/failures, traces, CI for the submitted version, and the student's limitations paragraph.
- `AGENT-TEAM.md`: the student's final one-page record of agents, access, recommendations, decisions and evidence. The existing agent-prepared inventory is supporting material.
- Actual anonymous peer notes given and received. If received notes have not arrived by November 6, say so in the limitations; the brief then assesses this part from the notes given.
- A **3–5 minute recording** showing actual model-selected/submitted actions without manual move selection. Link it from README and the PR description; instructor, TAs and assigned peers must be able to view it.

The PR description states `DemonRain7`, the project title, and links to the folder's README, evaluation, agent-team log, peer notes and recording.

## Version and timing

The last push to the PR branch before the deadline, as recorded by GitHub, determines submission time and the graded version. CourseWorks still needs the PR URL by the deadline. Later pushes are corrections and are not graded unless the PR description explicitly requests a later version; then that push's time and the late policy apply to the whole submission. Never force-push after the deadline.

Preserve the existing candidate tag as historical development evidence. A new exact `midterm` tag is no longer the specified hand-in. Keep final results and CI tied to the actual submitted course commit.

## Public delivery and reproduction

Retain GPL source notices and `COPYING`; separate inherited source from our additions with inspectable source/commit/patch evidence. Do not rely on inaccessible private PRs as the only evidence.

Original `.CA2` resources and manual redistribution terms remain unresolved. Keep them out of the public PR and establish a lawful, reproducible recipient acquisition route before final delivery; see [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md). The instructor resolves unclear publication rights. Exclude credentials, personal peer data, raw private logs, installed dependencies, build caches and large generated artifacts.

Use the [prepared workflow template](../delivery/midterm-demonrain7.yml). Its commands run from our folder, without secrets or paid model calls. All five check kinds must pass: rule invariants, legal/illegal actions, terminal behavior, an observed regression, and episode limits. A template or green personal-repository CI does not establish green course-repository CI.

## Dates and next work

- **October 26:** formative checkpoint: five-operation engine, baseline episode, at least one live model episode/trace, first comparison table and green CI.
- **Week of November 2; notes by November 6:** actual fifteen-minute partner playtest and note exchange.
- **November 7, 11:59 p.m.:** complete course PR and submit its URL.
- **November 9:** recording assignments announced.
- **Before class November 16:** three silent-playtester responses.

Follow [MIDTERM_PLAN.md](MIDTERM_PLAN.md) and [IMPLEMENTATION_TODO.md](IMPLEMENTATION_TODO.md). The personal [development repository](https://github.com/DemonRain7/catacomb-midterm), PRs #1–5 and candidate `midterm-v0.1.0-rc1` retain useful history; they are not the required course submission. Get Out! and Motivation Atlas remain separate assignments. The optional Handshake contest is excluded.
