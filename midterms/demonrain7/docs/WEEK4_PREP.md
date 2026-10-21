AI-use disclosure: Codex prepared the technical annotations, adapter, and checks on October 12, and revised this guide in English on October 17, 2026.

# Week 4 preparation: Catacomb II

The [Week 4 page](https://courseworks2.columbia.edu/courses/258228/pages/week-4-prep?module_item_id=3746715) asks for:

| Task | Project evidence |
| --- | --- |
| Annotate a bounded rule/manual/source excerpt as states and decisions | [Rule/source map](RULE_SOURCE_MAP.md), state diagram, initial state, charge/release excerpt, acceptance checks |
| Prepare the core-loop skeleton | Native C/SDL2 loop, original level loading, extracted `GameTick`, and headless process traces |
| Prepare the player interface | [Interface contract](INTERFACE.md): pixels/HUD, action allowlist, tick duration, invalid-input and terminal behavior |

The interface describes what the player observes and how it acts. A new website or gameplay redesign is not a Week 4 requirement.

## Proposed scope

**Game:** Catacomb II / The Catacomb, DOS reference through CatacombSDL. **Evidence:** original manual `INSTRUCT.TXT`, bounded C source functions, and recorded native level-1 execution. **Reuse terms:** preserve upstream GPL notices; original resource redistribution permission is not established.

Use level 1, original starting inventory, movement/combat/pickups, and death or any original exit ending the episode. Instructor scope approval is not yet recorded.

## Two-minute technical walkthrough

1. Explain `Running → Dead / Cleared`. `Truncated` means the evaluator budget expired; it is not an original victory/loss rule.
2. When ready for a visible window, run `python3 scripts/catacomb_env.py --human`. Build first on the Mac.
3. Run `python3 scripts/record_week4_demo.py` headlessly. Use `python` on Windows.
4. Compare frames `00004.png` and `00005.png`: hold fire to charge, then release to shoot. Frame `00006.png` shows the nuke and inventory change.
5. Show matching actions and frames in `trace.jsonl`; observation and invalid requests do not advance state, and one action allows at most 32 ticks.

The original local record is `runs/week4-verified-20261012/`: nine frames, final tick 177, status `running`. It is not a full-level completion or the required presentation recording.

## Reading connection and observations still needed

[Anthropic, Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents), especially **Agents** and **Appendix 2: Prompt engineering your tools**, informs the explicit feedback, parameter, error, and stopping contracts. The current scripted demonstration is a fixed workflow, not an autonomous model player.

Schell lens #28, **The State Machine**, is assigned. These notes organize technical states and transitions; they do not claim a personal reading reflection or page-by-page verification of the book.

The [Squakenet gameplay reference](https://www.youtube.com/watch?v=0T5foLk5arQ) was identified from its description; a timestamped viewing record remains to be made. Observe the opening, first charged shot, and first door/exit, recording action, visible change, and uncertainty. Complete the assigned readings and documentary discussion separately. Validate actual Mac input, sound, and play using [MAC_HANDOFF.md](../MAC_HANDOFF.md).

## Submission status

Week 4 says **no submission — hold for in-class exercise**, while the syllabus's October 5 row mentions a checkpoint and an Asana-linked PR. Week 5 also says **No submissions tonight!** Do not infer a missed standalone graded submission from the syllabus schedule alone.

This repository contains [configuration](../config/week4.json), a [reusable skill](../skills/catacomb-validation/SKILL.md), and [implementation/self-review evidence](IMPLEMENTATION_REVIEW.md). A separate October 19 independent review is now recorded in `docs/evidence/`; human playtest evidence remains pending. The October 21 midterm brief supersedes the older Asana-linked hand-in wording: see [SUBMISSION.md](SUBMISSION.md) for the required course-folder PR and CourseWorks URL.
