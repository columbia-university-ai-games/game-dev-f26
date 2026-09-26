---
name: rule-change
description: "Use when adding, changing or removing a game rule, legal action, observation or outcome. Ties each change to evidence in the rule and source map, a test written first, and a summary the reviewer can check."
---

# Change a rule with evidence

The game engine owns state. A rule change touches three things together: the
engine code, its test and the rule and source map. A change that updates one
without the others leaves the reviewer nothing to check against.

## Steps

1. Find the rule in `docs/rule-source-map.md`. Quote its row and its
   evidence label. If the rule is missing, add a row first, with the
   strongest label you have: `code`, `manual`, `observed` or `assumed`.
   Never promote a label without new evidence; an `assumed` rule stays
   `assumed`, and you say so in the summary.
2. Write the test before the change. Use the acceptance trace or a new
   short trace: the actions, the expected state after each, the outcome.
   Run it and confirm it fails for the reason you expect.
3. Change the engine (`course_game/world.py` in the starter). Keep the
   change to the one rule.
4. Check the playing agent's boundary in `course_game/player_interface.py`:
   - `observe` returns only what a player in that position could know;
   - `legal_actions` does not name anything the observation has not shown;
   - a refused action changes nothing and is counted.
   Add or adjust a test if the change moves any of these.
5. Update the map row: the rule, the file and line, the label.
6. Run `uv run --frozen python -m unittest discover -s tests -v`. All tests
   pass, or you stop and report the failure.
7. Write the summary for the reviewer, in this order:
   - the rule as it now reads, with its label and evidence;
   - the test that proves it, and that it failed before the change;
   - any boundary effect from step 4, or "none";
   - anything you assumed.

## Do not

- change a rule and its test in a way that makes both agree on something no
  evidence supports;
- give the playing agent file access, the World object, or the map;
- mark your own work reviewed. An independent review task does that.
