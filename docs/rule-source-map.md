# The Garden Door: rule and source map

A worked example of the scope record's rule and source map, for the starter
game. The Garden Door is original to this course, so every claim can carry
the strongest label, `code`, with a file and line. Your classic will mix
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

| Action | Allowed when | Changes | Evidence |
| --- | --- | --- | --- |
| `look` | always, before the ending | nothing; repeats the observation | `code`: line 33 |
| `east` | in the hall | `room` to `workshop` | `code`: lines 37 to 38 |
| `west` | in the workshop | `room` to `hall` | `code`: lines 39 to 40 |
| `take key` | in the workshop, key not yet taken | `key_taken` true; brass key into `inventory` | `code`: lines 41 to 44 |
| `unlock door` | in the hall, holding the key, door locked | `door_open` true | `code`: lines 45 to 49 |
| `north` | in the hall, door open | `room` to `garden`; `won` true | `code`: lines 50 to 54 |

Any other command changes nothing (`code`: lines 55 to 56).

## Outcomes

| Outcome | Condition | Evidence |
| --- | --- | --- |
| Win, score 1 | `won` becomes true | `code`: lines 53 to 54; `course_game/player_interface.py`, `outcome` |
| Step limit, score 0 | 20 steps without winning | `code`: `player_interface.py`, `outcome`; a course choice, not a rule of the game |

## Choices made for the playing agent

These belong to the reconstruction, not to the game. Record yours the same
way.

- `legal_actions` lists only actions that change state now, plus `look`.
  The CLI instead accepts `unlock door` without the key and answers "You need
  the brass key." An agent gets a shorter list and a generic refusal. A
  parser game such as Zork may be better served by the whole verb list and
  the game's own refusals; say which you chose and why.
- `take key` is listed only while the key is visible. Listing it in the hall
  would reveal the key before the player has seen it.
- A refused action counts as a step and as an invalid action. It never
  changes state.

## Acceptance trace

From `reset`: `east`, `take key`, `west`, `unlock door`, `north`. After step
2 the inventory holds the brass key; after step 4 the door is open; after
step 5 `outcome` is terminal, "reached the garden", score 1, five steps, no
invalid actions. `tests/test_player_interface.py` runs this trace.

## Open questions

None for this game. For yours, list each question the evidence could not
answer, and mark the rule `assumed` until it can.
