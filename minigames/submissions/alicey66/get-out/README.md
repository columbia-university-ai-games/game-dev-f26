# Get Out: Misdelivered Stamp

**Zixuan Yang · UNI: zy2786 · GitHub owner: alicey66**

A puzzle author marks a useful stopping point with an intention. The recipient decides whether to open that stamp and match the author’s label. A mismatch changes the player’s position within a previewed set of previously visited stops. The exit remains the goal; collecting stamps is optional.

## Run and play

Open this folder’s `index.html` directly in a browser. No build, account, network, or runtime model is needed. Use arrow keys, WASD, swipe, or direction buttons. Choose a direction and slide until a wall or boundary stops you. Crossing the exit during a normal slide wins immediately. A blocked direction costs no move. Undo, Reset, direct hints, board editing and exchange remain available.

The first board introduces two stamps. The second places two stamps later in the route, allowing a mismatch to preview several past stops. The other boards retain ordinary escape play and can be edited to add stamps.

## Author a board: point, then label

Choose **Design a puzzle**. Stamp placement is selected by default. Tap a reachable floor stopping point, then choose one label:

| Label | Shared definition |
| --- | --- |
| ⚓ Stop | Use an obstacle to obtain a stopping position. |
| ↱ Turn | Use this position to change the next sliding direction. |
| ↝ Detour | Move away from the exit to build a later route. |

There is no text field and no direction to assign. Up to two distinct stamps are allowed. Start, exit, wall and transit-only squares cannot hold stamps. Saving and Check & play verify both the board’s solvability and the stamp’s reachability. Later wall edits may invalidate a stamp; export and Check & play recheck it. Cancel restores the current play session; successfully playing an edited board starts a new session.

Author mode highlights the blocking faces associated with possible normal arrivals at the selected stop, plus unobstructed exit sightlines. During play, a normal arrival at a stamp highlights its actual blocking face and available exit sightlines. These cues are computed from the board and arrival direction, never from the author’s label. They show geometry, not an approved interpretation.

## Open, match, or leave it alone

Unjudged stamps display **?**. Only a normal slide ending there offers **Open stamp** or **Keep moving**; crossing the square does not. Moving away or choosing Keep moving leaves the stamp undecided. A later normal visit can offer it again.

Opening displays the three shared labels and a reminder of the consequence. The player may choose a label or continue without judging. Each stamp permits one judgment per round. Matching the author makes the stamp gold; a mismatch makes it grey. Both remain in the album with **Author / You** labels. The wording is “Matched / Not matched,” not a grade of comprehension.

The album reports **Matched · Judged · Total** separately. Unopened and skipped stamps are not mismatches. A stamp can fit multiple labels, so agreement is a description of the exchange, not a claim that the author has the only defensible interpretation.

## A mismatch changes position

1. Record the judgment and consume that stamp’s opportunity for the round.
2. Look backwards through actual normal-slide stops in this round. Select the most recent three different positions, excluding the current one. With fewer than three, use those available; with none, use the original start.
3. Highlight the entire pool and list its coordinates. Every candidate has equal probability. The player chooses **Confirm position change** after inspecting it.
4. Move to the sampled position without adding a slide move. Increment the round’s position-change count. Do not trigger victory or offer another stamp, even if the destination contains one.

Movement, another judgment, Undo, Reset, editing, board import and level changes are locked while choosing a label or confirming the preview. Continue without judging leaves the choice stage; a recorded mismatch must finish its position change. Downloads remain available.

Teleport and Undo do not enter the normal-stop history. Undo also does not erase actual stops already visited, so a previously visited but undone stop can remain a candidate. A normal slide onto the exit can enter that history; a later teleport onto the exit does not win. Hints correctly handle leaving and returning to such an exit position.

## Undo, Reset and session boundaries

Immediately after a position change, the first Undo returns to the stamp. The judgment remains spent. A second Undo reverses the preceding slide. In general, each Undo reverses the most recent position change; if the player has made further slides, those are undone first. Judgment history and the count of actual deliveries are not rolled back.

Reset begins another round on the same board. It restores stamps and position and clears round moves, hints, position-change count and normal-stop history. It retains cumulative Reset count, all previous judgments and the session’s action trace.

Each stamp’s first recorded judgment belongs to the first-judgment summary. All later judgments after Reset belong to the retry summary, even if some intervening rounds left that stamp unopened. The summaries report matches and judgments separately. Three choices give a uniform random guess an expected agreement rate of one third; two stamps are far too few to treat agreement as a measure of learning.

Changing, importing, or successfully editing a board starts a new session, as does reloading the page. Statistics are not stored across reloads. This is transparent session bookkeeping, not an anti-cheat system.

## Exchange and return a playtest

Use **Exchange a board → Copy board + stamps**, then send the entire code to a partner using this variation. The code includes the board and author labels, but no player judgments or Reset statistics. Original S/E/#/. board text still imports here without stamps. The unmodified reference does not understand stamp codes. Invalid imports leave the current session unchanged.

After playing, choose **Inspect your move trace → Download trace**. The file includes first and retry judgments, Reset count, stamp offers/skips, slides, hints, previews, deliveries and Undo. The recipient can return that file to the author. Under **Author: review a returned playtest**, the author selects it locally and sees summaries plus the judgments. Reading a returned file does not replace the active game or send data anywhere. Use anonymous player labels when discussing results.

The reader checks the trace’s structure and judgment consistency. It does not prove that a file is unedited or reconstruct a human’s reasoning. The author’s labels are hidden in the normal play interface but travel in the exchange data; this is a presentation convention, not a secrecy guarantee.

## Design and next test

The course guide’s useful-hint question, applying Schell Chapter 14 and Lens 58, prompted the exchange of intentions rather than direction answers. The risk introduces a deliberate conflict: a clue can invite curiosity and also become something to avoid. The test should distinguish choosing not to participate from failing to understand the puzzle.

The four required reflection sections are in `PR_BODY.md`. They propose comparing author intention, recipient explanation and subsequent actions. They do not treat a high match count as proof of understanding or a single session as a causal test of risk. The design remains small: one stamp protocol, three labels and a bounded consequence, with no required collection goal.

## Checks and credits

From the repository root:

```sh
python3 scripts/minigames.py check --owner alicey66
python3 scripts/minigames.py test --owner alicey66
```

There are 24 deterministic game tests: seven inherited sliding checks and seventeen stamp/session checks. The submission keeps all changes in the owner folder. `rule-source-map.md` records new designer conventions; `experiment.md` lists local verification and the planned player session.

The course adaptation is based on Eric Zimmerman’s *Get Out!*, exercise 11 in *The Rules We Break*. The four teaching boards and workshop guides are retained. Schell’s *The Art of Game Design*, third edition, Chapter 14/Lens 58 and the course’s original exercise cards inform the design; no book passage is quoted. Codex assisted with implementation, tests and editing. No external assets or runtime services were added.
