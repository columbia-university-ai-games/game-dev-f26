# Design and playtesting

## Decisions

I chose three hint levels: a question, a useful feature, then the next move.
I want a stuck player to feel willing to continue, even if they eventually need
the direct answer. This applies the course's progressive-hints exercise for
Schell, *The Art of Game Design*, third edition, Chapter 14 and Lens 58: The
Puzzle. It is a classroom application, not a quotation from the book.

The sliding rules, exit detection, boards and shortest-path solver stay the
same. Hints are optional. A successful move or undo starts the hint sequence
again at the new position; a blocked move preserves the current clue.

## Possible outcomes

My prediction is that a small nudge can make a stuck player more willing to
try another move. I am not predicting that they will never need level three.
An alternative is that the first two levels feel like extra clicks and the
player immediately asks for the answer. That would question whether the
earlier clues are useful enough. Completion or speed alone cannot show
whether someone felt encouraged.

## Playtest

I played the reference and completed the board-design/exchange activity. After
exchanging boards, I carried over the previous approach, then realized I had
to rethink the route. I paused to compare choices and hesitated about trying
again. I felt some frustration, but also curiosity about the intended solution.
This is my reference-game experience, not evidence that the variation helped
another player. No exact move count or board code was recorded here.

I then tried the variation with one classmate, Player A. They said the hints
were useful, and one hint request was often enough for them to finish a puzzle.
We checked hints, movement, Undo and Reset and found them working normally.
No exact board list, attempt count, hint-level log or timing was recorded, so
"often" is a qualitative observation rather than a measured success rate.

This is encouraging for my prediction that a hint can help someone keep going.
It does not yet show how much the staged format helped compared with the
reference's direct hint. On another unfamiliar board, I would watch what the
player does after each level and ask: "What made you keep trying or stop?"
Repeating a known solution introduces a practice effect. The downloaded trace
records hint levels and actions, not feelings.

## Next decision

For now I would keep the staged clues and test another unfamiliar board, since
Player A found the hints useful. If another player finds the first two levels
unhelpful, I would keep them available but add an explicit option to request
the next move immediately. The question is whether the extra choice supports
continued play, not whether everyone uses fewer hints.

## Checks and limitations

Implementation: `hints.js` supplies state-aware clues; `app.js`, `index.html`
and `style.css` add the sequence and persistent clue panel. Trace export keeps
the existing format marker and adds the requested levels and counts. The pure
rules and reference sources are unchanged.

Owner validation and report validation passed. All 11 deterministic game/hint
tests and all 83 Python tests (including the lab tooling tests) passed in an
isolated environment installed from the course lockfile. Offline headless setup
diagnostics and gallery generation passed; no live model request was made. A local jsdom integration
check passed eight groups of UI lifecycle cases, including hint progression,
move/undo/reset clearing, editor cancellation, board imports, completion and
trace export. This is a simulated DOM check, not a real-browser playtest.

A separate code reviewer found no blocking defects, reran the 11 game tests,
and independently checked the UI lifecycle with a mocked DOM. The rules engine,
teaching boards and original engine tests are byte-identical to the reference.

The manual browser and classmate results above were supplied by the student;
they are separate from the automated checks. Phone/narrow-screen play has not
been specifically confirmed. The browser tool blocked local file URLs, so the
agent did not conduct a real-browser check.

At PR creation, GitHub's submission-boundary check passed. The full Minigame
lab and Setup workflows require a course maintainer to approve this fork's
workflow runs; they are not being reported as passing CI.
