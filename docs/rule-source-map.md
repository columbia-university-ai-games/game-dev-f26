# The Garden Door: rule and source map

A worked example of the scope record's rule and source map, for the starter
game. The Garden Door is original to this course, so every rule of the game
carries the strongest label, `code`, with a file and line; one choice about
the playing agent is still `assumed`. Your classic will mix
`code`, `manual`, `observed` and `assumed`; an `assumed` line tells you and
your agents what still needs checking.

## Scope

The whole game: three rooms, one key, one door. The episode ends when the
player reaches the garden or after 20 steps. Nothing is left out.

## State

| State | Starts as | Evidence |
| --- | --- | --- |
| `room` | `hall` | `code`: `course_game/world.py`, line 8 |
| `inventory` | empty | `code`: line 9 |
| `key_taken` | false | `code`: line 10 |
| `door_open` | false | `code`: line 11 |
| `won` | false | `code`: line 12 |

## Legal actions and what they change

The engine's rules, as `course_game/world.py` enforces them for a person at
the command line:

| Action | Engine accepts it when | Changes | Evidence |
| --- | --- | --- | --- |
| `look` | always, even after winning | nothing; repeats the observation | `code`: line 33 |
| `east` | in the hall | `room` to `workshop` | `code`: lines 37 to 38 |
| `west` | in the workshop | `room` to `hall` | `code`: lines 39 to 40 |
| `take key` | in the workshop, key not yet taken | `key_taken` true; brass key into `inventory` | `code`: lines 41 to 44 |
| `unlock door` | in the hall, holding the key; the engine does not check whether the door is already open | `door_open` true | `code`: lines 45 to 49 |
| `north` | in the hall, door open | `room` to `garden`; `won` true | `code`: lines 50 to 54 |

Any other command changes nothing (`code`: lines 55 to 56). After winning,
every command except `look` is answered "The game is complete" and changes
nothing (`code`: lines 35 to 36).

## Outcomes

| Outcome | Condition | Evidence |
| --- | --- | --- |
| Win, score 1 | `won` becomes true | `code`: `course_game/world.py`, lines 53 to 54; `course_game/player_interface.py`, lines 75 to 76 |
| Step limit, score 0 | 20 steps without winning | `code`: `course_game/player_interface.py`, line 21 (the default) and lines 77 to 78; a course choice, not a rule of the game |

## Choices made for the playing agent

These belong to the reconstruction, not to the game, so their evidence is
the interface code. Record yours the same way.

| Choice | Evidence |
| --- | --- |
| `legal_actions` lists only actions that change state now, plus `look`. The engine accepts `unlock door` without the key and answers "You need the brass key", and accepts it again once the door is open; the agent gets neither in its list, and a generic refusal if it tries. A parser game such as Zork may be better served by the whole verb list and the game's own refusals; say which you chose and why | `code`: `course_game/player_interface.py`, lines 38 to 54 |
| `take key` is listed only while the key is visible. Listing it in the hall would reveal the key before the player has seen it | `code`: `course_game/player_interface.py`, lines 50 to 53 |
| After winning, nothing is legal, `look` included | `code`: `course_game/player_interface.py`, lines 41 to 42 |
| During an episode, a refused action counts as a step and as an invalid action and never changes state. A reply that is not text counts the same way | `code`: `course_game/player_interface.py`, lines 60 to 70 |
| After the episode ends, every action is refused and nothing is counted | `code`: `course_game/player_interface.py`, lines 58 to 59 |
| The player calls three operations: `observe`, `legal_actions` and `step`. The runner calls `reset` and `outcome` and keeps the episode object; `episode._world` is reachable from Python, so the runner, not the player, must hold it | `assumed` until the runner exists and a test checks it |

## Acceptance trace

From `reset`: `east`, `take key`, `west`, `unlock door`, `north`. After step
2 the inventory holds the brass key; after step 4 the door is open; after
step 5 `outcome` is terminal, "reached the garden", score 1, five steps, no
invalid actions. `tests/test_player_interface.py` runs this trace.

## Open questions

- Does the Session 4 runner give the player only `observe`, `legal_actions`
  and `step`? `assumed` until the runner exists and a test checks it.

For your game, list each question the evidence could not answer, and mark
the rule `assumed` until it can.
