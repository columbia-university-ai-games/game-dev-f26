AI-use disclosure: Codex audited the October 21, 2026 assignment against actual repository evidence. Planned work, student judgment and human observations remain separate.

# Midterm requirements and current status

Primary brief: [Midterm assignment, revised October 21](https://courseworks2.columbia.edu/courses/258228/assignments/1749857). **Final due: November 7, 2026, 11:59 p.m. America/New_York; 20 points, 20% of the course.** Submit one course-repository PR URL. October 19/26 are formative checkpoints.

The [completion plan](MIDTERM_PLAN.md) covers phases P0–P6, owners, dependencies, dates and acceptance gates. Keep Catacomb II level 1 and the adapted GPL C/SDL2 source; no new game or engine rewrite is required.

| Required artifact or behavior | Current status |
| --- | --- |
| Bounded playable classic | Original level 1, rules and inventory; ordinary-interface and packaged exit replay verified |
| Scope record | September 26 Week 3 post located; level 1 matches the early-level boundary; see `SCOPE.md` |
| Rule/source map | Inherited rules have evidence/locators; deliberate adaptations use `design` and link `DESIGN_SPEC.md` |
| Original resources and fresh clone | Files/hashes documented; lawful recipient resource supply and full fresh-clone player run remain open |
| Five interface operations or equivalents | Situation adapter implements reset, observe, legal_actions, step and outcome; locally verified, including actual original-resource resets |
| Real model player | Implemented/offline-tested; first image request failed reauthentication before a model action |
| Credible baseline | Visual navigation/combat heuristic; five preliminary episodes, no clears; investigate performance on development cases |
| Declared suite/held-out cases | Three distinct reachable starts declared before tuning; development/held-out split and 18-trial preflight plan implemented; live comparison pending |
| Current-frame/history comparison | Both implemented; actual matched live trials pending |
| Limits/failures/leakage | Implemented/tested; preserve through situation support and expose all metrics in final table |
| Deterministic CI | Four course project jobs passed at 3499915; 31 offline tests and nested Windows build passed. Shared minigame workflow-protection check conflicts with the required file; see course CI evidence |
| Production agents | Instructions, skill and independent review exist; implementation-session links and two named skill invocations need an audit trail |
| Course-folder `README.md` | Direct commands from the student folder prepared; course migration verification recorded separately |
| Course-folder `EVALUATION.md` | Top-level checkpoint links actual historical results and new protocol; final live table pending |
| Course-folder `AGENT-TEAM.md` | Top-level agent-prepared evidence inventory exists; student's final one-page version pending |
| Peer notes received/given | Protocol prepared; actual 15-minute partner play and notes pending, notes due November 6 |
| Recording | Outline/scripted acceptance clip exist; 3–5 minute autonomous-model demonstration pending |
| Course PR | [Draft PR #55](https://github.com/columbia-university-ai-games/game-dev-f26/pull/55), base `main`, complete student folder plus one workflow; continue the same PR |
| Staff invitations / Asana | Removed from midterm requirements by the explicit October 21 hand-in steps |
| CourseWorks | Submit the course PR URL; personal repo/tag links are insufficient; not submitted |

Full ports, new NPCs, creative rewrites and the Handshake contest are optional. No new NPC behavior before the requested discussion. Contest participation is excluded.

Related dates: formative checkpoint October 26; partner notes November 6; final submission November 7 at 11:59 p.m.; recording assignments November 9 and three responses before class November 16. The last pre-deadline branch push determines the graded version; staff merge. See [SUBMISSION.md](SUBMISSION.md).
