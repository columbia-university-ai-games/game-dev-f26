# Independent rule review request

Rule: one adjacent chaser step after each successful slide, usually pursuing but wandering every third turn; capture at stopping positions ends play, exit wins first. See rule-source-map.md for code evidence. Labels now code because engine/tests implement them; human experience remains unobserved.

Five new chaser tests failed before implementation; all 14 game tests now pass. Copied shortest-path test changed from right/down to down/right because the former route now gets caught. All teaching-board solutions were replayed by tests.

Boundary: browser observations include visible C/caught and detached arrays; refused movement preserves state. No course_game/player_interface.py changes or model access. Reset/undo reuse immutable states. Solver key includes C and movement phase.

Assumptions: deterministic two pursue/one wander cycle, farthest reachable spawn, capture only at stopping cells, slide-over safe, exit priority, no C if no eligible reachable spawn. No human playtest or browser QA completed: no available browsers. Shared Python check environment errors are recorded in experiment.md.

Review engine.js, app.js, tests/*.test.cjs, rule-source-map.md and presentation changes. Read-only findings; do not approve or merge.
