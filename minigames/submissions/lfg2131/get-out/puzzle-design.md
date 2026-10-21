# Ten-board challenge sequence — solution spoilers

This revision responds to Player A finding the original sequence too easy and
never needing hints. The supplied `get_out_challenge_levels.js` was not found
in Downloads. Replacement candidates were generated from sparse wall segments,
screened for reachability, then selected by inspecting their layouts and routes.
Contiguous rails and shelves make the stopping relationships visible; the final
selection avoids irreversible traps and forced corridor mazes.

These are design intentions and deterministic checks, not human difficulty
ratings. Longer shortest routes do not establish understanding, enjoyment, or a
strict increase in difficulty from one board to the next. A fresh playtest must
check whether these intended discoveries actually occur.

## Verified shortest solutions

`U` = up, `R` = right, `D` = down, `L` = left. Coordinates below are one-based.
Paths are for inspection; the player interface offers the unchanged optional
Think → Notice → Reveal system. Every board is solvable without requesting help.

| # | Board | Size | Minimum slides | One shortest path |
| --- | --- | --- | --- | --- |
| 1 | Beyond the door | 7 × 7 | 7 | R U R D R U L |
| 2 | Offset approach | 7 × 7 | 7 | U L U R U L D |
| 3 | The far edge | 7 × 7 | 8 | D R U R U L D L |
| 4 | Change the angle | 7 × 7 | 8 | U R D R D L U L |
| 5 | Lower crossing | 8 × 8 | 9 | U L D R D L U R U |
| 6 | Parallel routes | 8 × 8 | 9 | U L D R U R U L D |
| 7 | The distant setup | 8 × 8 | 10 | R D L D R D R U L U |
| 8 | Two circuits | 9 × 9 | 11 | R U L U R D L D L U R |
| 9 | Before the last turn | 9 × 9 | 12 | D R U R U L D R D L U R |
| 10 | Think before you peek | 8 × 8 | 15 | L D R U L D R U R U R D L U L |

## Intended discoveries

1. **Beyond the door:** The opening offers two legal directions. The upper bar
   and right pegs reward inspecting stops rather than pursuing the nearby exit.
   The wall at (7,6) first stops the player at (7,5), then helps set up a different
   column. This introduces planning with the same explicit movement instructions.
2. **Offset approach:** Start and exit share row 6, but the short barrier blocks
   a direct slide. Several stops around the upper peg prepare the final column.
   Recognizing the needed approach matters more than simply seeing the exit.
3. **The far edge:** One long rail and a top peg create a clean alignment problem.
   The empty left area lacks the stop needed to cross the exit; the rail's upper
   end gives access to row 3 from the far side.
4. **Change the angle:** Offset wall ends reuse the upper barrier from another
   side. The bottom-right border prepares a return to the exit row, so a useful
   local stop needs to be judged by the following slide as well.
5. **Lower crossing:** Three initial directions and separated vertical rails
   create alternative approaches. Lower pegs prepare a crossover and the final
   exit column; merely moving into the upper area does not establish alignment.
6. **Parallel routes:** The right rail and upper anchor demand a broad left-border
   circuit before the narrow approach beside the rail. This varies the earlier
   detour instead of repeating the same route with more floor cells.
7. **The distant setup:** Paired rails surround a near-top exit. A lower-right
   chain of stops must prepare the final approach. This combines border stops
   with stops supplied by both sides of interior walls.
8. **Two circuits:** Separate vertical spines and edge blockers link a high
   crossing with a lower-left circuit. The wall at (3,1) supplies the stop at
   (3,2); the player must leave the exit area again to reach its row correctly.
9. **Before the last turn:** Offset shelves require an upper-right setup before
   entering the visible exit row. The wall at (7,5) supplies the late stop at
   (8,5), rewarding planning backward from the last slide.
10. **Think before you peek:** Three offset shelves connect a lower circuit to
    a central crossing and then the exit row. The final setup depends on walls
    at (3,7), (6,8), (5,4), and (2,5), used in sequence. Along the shortest path,
    six positions offer at least three legal actions and seven slides increase
    Manhattan distance from the exit. The challenge comes from these dependencies
    and alternatives, rather than a forced fifteen-slide corridor.

## Inspecting apparent shortcuts

Each example compares two legal slides from the same position. The tempting
destination has a smaller Manhattan distance to the exit, but a longer shortest
route remains afterward. These are geometry/solver facts, not observed choices.

| Board; position | Closer-looking slide; moves left after it | Better setup; moves left after it |
| --- | --- | --- |
| 1; (7,1) | Up to (2,1); 8 | Right to (7,5); 6 |
| 8; (1,8) | Left to (1,1); 7 | Right to (1,9); 6 |
| 9; (9,6) | Right to (9,9); 3 | Left to (9,5); 2 |
| 10; (6,4) | Left to (6,1); 7 | Right to (6,7); 6 |

All 200 reachable positions across the ten boards retain a route to the exit.
Exploration therefore does not require an undo/reset to escape a losing state;
those controls remain available. The tests independently traverse the stopping
graph to establish minimum lengths, replay winning paths, compare the solver
from every reachable position, and check all three hint stages at those positions.
They also check that each board has a recoverable closer-looking alternative.
Custom boards still support honest no-route guidance when they contain traps.

The intended sequence is early alignment, middle crossovers, then compound
setups. For Player B, inspect the opening, a middle board, and boards 8–10 for
planning, useful errors and explained clue use. Increased hint requests alone
would reflect the changed puzzle conditions and would not prove better hints.
