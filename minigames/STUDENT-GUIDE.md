# Play, exchange, then make it yours

## 1. Play Get Out yourself

Open `minigames/get-out/index.html`. Use the arrows, WASD, swipe, or the direction
buttons. Try a board before asking for a hint. What did you have to discover?

## 2. Make a puzzle and play your neighbor's

Choose **Design a puzzle**, arrange the walls, start, and exit, then choose
**Check & play**. Open **Exchange a board → Get current code** and send that
code to your neighbor. Paste their code into your game and choose **Load code**.
Keep your own code somewhere if you want to use it later.

Watch each other play without coaching. Ask: **What changed your understanding?**
Use the game's **Designer’s guide** for ideas about goals, progress, hints,
and discovery. Choose one thing you want to change after watching your neighbor.

## 3. Ask Codex to make your variation

Open the class `game-dev-f26` project in Codex and paste this:

> Use the minigame-variation skill to help me make my own Get Out. Use my
> signed-in GitHub account and set up my branch and game folder automatically.
> After playing my neighbor's puzzle, I want to change: [your idea]. Make one
> small change, test it, and show me how to play my version.

If you want to keep the board you designed, include its board code in the
message. You can also ask Codex to help choose a change based on what you
observed. There is no required “hints” exercise.

**Codex handles the setup.** It reads the course instructions, gets your login
from `gh`, creates your branch and personal game copy, and runs the checks.
You do not need to enter your username, type Git/Python commands, or install
a separate plugin. If skill discovery fails, tell Codex to read
`.agents/skills/minigame-variation/SKILL.md` and follow it.

Play the result, then give it to your neighbor. Tell Codex what actually
happened and what you want to revise. You supply the design decisions and
interpretation; Codex can help record your words and the checks it ran.

## Save it for review later

When you are ready, tell Codex:

> Review my variation and prepare a draft pull request to the class repository.
> Include only my game folder. Put my design decisions, possible playtest
> outcomes, what I would observe, and what I would change next directly in the
> PR description. Separate predictions from anything we actually observed.

Codex checks the changes, commits your folder, pushes your branch to the class
repo or your existing fork, and opens or updates one draft PR. The instructor
reviews and merges it. Your game appears in the shared gallery after merging.
No student edits a shared gallery index.

In the PR description or a labeled **Design and playtesting** comment, explain
what you changed and why, what you expect a player to do, a different possible
outcome, and what you would keep or change depending on the result. Describe
what you will observe; label actual playtest observations when you have them.
A few specific sentences or bullets are enough. Codex can organize your words.
No AI-use disclosure is required for this lab.

Follow **CourseWorks** for submission requirements and deadlines. The Motivation
Atlas minigame remains due
**October 18** and follows its own repository instructions. Get Out practice
does not automatically complete that assignment.

## If setup gets in the way

The class checkout needs the lab files, Codex, a signed-in GitHub CLI (`gh`),
Python 3.11+, and Node 22+. These are setup requirements for the instructor/TA
to verify before the workshop. Playing the game itself needs only a browser.
A downloaded gallery is enough to play; Codex needs the full course checkout.

If an account or tool is unavailable, ask a TA and keep playing/exchanging
puzzles while it is fixed. Codex should explain the specific blocker without
asking you to repeat information it can already retrieve. It must preserve
existing work. Keep credentials, private book pages, and player personal data
out of the public repository.

More design options: [exercise cards](EXERCISES.md). Technical details:
[lab tools](README.md) and [reference game](get-out/README.md).
