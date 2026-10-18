# Get Out! Gradual challenge

Principle: sequence, with optional progressive hints, following the course
exercise card's application of Schell Chapter 14 and Lens 58: The Puzzle.

## Design and playtesting

- Decisions: My experience was that the game easily fell into two extremes:
  too easy and boring, or too difficult and completely stuck. I wanted a
  smoother transition. The revision keeps four original boards and inserts
  three bridge boards, each differing by one or two walls from the following
  board. Players can step back or skip ahead. Switching starts a fresh attempt.
- Possible outcomes: Players may transfer a stopping-point idea from a
  bridge board to the next puzzle. They may instead repeat a memorized route,
  remain stuck, or find the added practice boring. Optional hints reveal a
  question, then a stopping point, then one move. If players still cannot
  explain a route after help, the teaching sequence needs revision.
- Playtest: Ask Player A to try a bridge board and its following board,
  choosing how much help to request. Watch whether they predict where a slide
  will stop, reuse an idea, request stronger hints, skip, or abandon a puzzle.
  Record one revealing remark and prior familiarity. This planned comparison
  follows the original experience described above.
- Next decision: Keep a bridge that helps a player explain the next board.
  Revise its walls or lesson cue if the same confusion persists; make practice
  easier to skip if it adds repetition. Keep the lightest useful hint, and
  revise a hint that prompts copying without understanding. Shortest routes
  increase from 3 to 9 moves. Use route choices and player explanations to
  judge the sequence.

## Checks

All 16 Node tests and the manifest check passed. Tests cover every reachable
teaching-board position, hint agreement with the solver, and optional-help
triggers. All 83 repository Python tests passed in the project environment.
The movement engine is unchanged. Desktop, phone, and narrow-screen browser
checks passed; independent code review found no actionable issues.
