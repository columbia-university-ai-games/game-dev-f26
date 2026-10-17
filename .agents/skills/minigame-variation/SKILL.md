---
name: minigame-variation
description: Use when a student wants to make their own Get Out, change a puzzle after peer play, or prepare their variation for review in the class repository.
---

# Minigame variation

Student flow: play manually, design/exchange boards with a neighbor, then ask
Codex to make one personal variation. Handle setup and commands yourself.
Read root `AGENTS.md`, `minigames/STUDENT-GUIDE.md`, and the relevant exercise
in `minigames/EXERCISES.md`. Do not make the student complete a setup checklist
or supply information available through tools.

## Automatically establish ownership and workspace

1. Run `gh api user --jq .login` and normalize the login to lowercase. Use that
   authenticated identity for ownership. Do not ask for a username. If gh is
   unavailable or unauthenticated, identify that specific blocker and help
   with installation/sign-in; never infer identity from Git author name/email.
2. Inspect `git status`, current branch, remotes, and existing student folder.
   Identify the class repository remote by its URL
   `columbia-university-ai-games/game-dev-f26`, not by assuming `origin`.
   Add a clearly named class remote if absent; fetch its `main` as the base.
   If offline, preserve work and report the inability to verify the base.
3. Use branch `<login>/get-out`. If a prior student variation branch exists,
   resume it when it contains only that student's lab changes. Compare against
   the class base before deciding. A changed principle does not need a new branch.
4. For a fresh start in a clean checkout, create and switch to that branch
   from the fetched class `main`. If the current checkout contains unrelated
   uncommitted work, leave it intact and create the student branch in a separate
   Git worktree from that same base. Use a fresh available worktree directory;
   do not reset, stash, overwrite, or include unrelated changes. If a worktree
   already holds the student's branch, work there. Tell the student where their
   game is when a separate worktree is used.
5. Read any existing manifest/report and resume the student's copy. Otherwise
   choose a principle ID matching their idea and run, at the working repo root:
   `python3 scripts/minigames.py new <login> --principle <principle>`.
   Use the available compatible Python launcher (`py` on Windows if needed).
   This copies the game and creates the report/manifest. Never overwrite a copy.
   If their idea is undecided, ask one design question based on their peer-play
   observation; do not ask them to choose technical IDs or default everyone to hints.

All game edits belong in `minigames/submissions/<login>/get-out/`. Shared
scripts, reference game, workflows, skills, and other students' games are
instructor-owned. If existing work makes ownership/scope ambiguous, explain
that specific conflict; continue unaffected inspection rather than deleting work.

## One small design cycle

- Reflect the student's idea and prediction in a short plan, then implement
  the requested bounded change. Ask only about a missing design decision.
  If they supplied a board code, preserve it as the starting board and verify
  solvability. Do not assume browser-edited boards were saved to source files.
- Run `python3 scripts/minigames.py check --owner <login>` and
  `python3 scripts/minigames.py test --owner <login>`. Rule changes need relevant
  tests and a consistent solver. Open the student's game and check the changed
  interaction, reset, undo, hints, completion, and narrow-screen controls.
  If browser tools are unavailable, identify the remaining manual checks.
- Show the playable file/preview to the student. Invite another peer playtest.
  Record actual checks and student-supplied observations in `experiment.md`.
  Preserve their design decisions and interpretation in their words. Ask only
  for missing design input. Record expected and alternative playtest outcomes,
  what each would mean, and a next decision. Label plans/predictions separately
  from observations; an unrun playtest can be described honestly as a plan.
  No AI-use disclosure is required for this lab.
- Update the manifest title/principle to match the change. Generate the gallery
  with `python3 scripts/minigames.py gallery` when useful; leave `build/` ignored.
  Do not make running commands or editing metadata a separate student task.

## Prepare the PR when the student asks

Run a separate review task or fresh review conversation on the student's diff.
Resolve concrete issues and repeat relevant checks. Human play evidence is
separate from code review. Inspect the full branch diff against the class base:
only the student's folder may appear. Resolve any unrelated branch history
before pushing; never silently bundle other work or force-push shared branches.

Stage only that folder, commit, and push to a verified class remote if writable,
or the student's existing fork. Use `gh pr list` to find an existing PR for the
branch before creating one. Open/update a draft against
`columbia-university-ai-games/game-dev-f26` main, using the actual pushed head
and the minigame PR template. Put **Design and playtesting** directly in the
PR description: decisions and rationale, expected and alternative outcomes,
playtest plan/actual observations, and the next design decision. Reuse the
student's notes; linking to experiment.md alone is insufficient. A clearly
labeled PR comment is also acceptable when updating an existing PR. Do not
invent reflections or ask for an AI-use disclosure. If access prevents pushing and no fork is
available, keep the local commit and explain the specific access blocker.

Drafts may contain TODOs. Before ready-for-review, complete the student-supplied
report and run `python3 scripts/minigames.py check --owner <login> --ready`.
Instructor approval controls merging. Follow CourseWorks for assignment
submission requirements and deadlines. The Atlas October 18 contribution
follows its own repository contract.
