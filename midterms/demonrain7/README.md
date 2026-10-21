AI-use disclosure: Codex assisted with the adapter, tests, documentation, and checkpoint preparation under the student's direction.

# Catacomb II: Classic reconstruction and visual player

A bounded **Catacomb II / The Catacomb** course project using the attributed
C/SDL2 source port below. It includes native/browser play, a strict visual
observation/action interface, a screenshot-based scripted baseline, and a
Vertex player with current-frame and bounded-history conditions.

**Current evidence:** a complete 303-action first-level acceptance replay;
five real baseline episodes (zero clears, all alive at the action limit);
independent review and corrected failure paths; three declared, reproducible
starts and the five-operation situation adapter. **Still pending:** live model comparison after Google
sign-in, actual peer notes, student-authored reflection and the recording/submission. A candidate release does not
mean the complete midterm is submitted.

- [October 21 completion plan and acceptance gates](docs/MIDTERM_PLAN.md)
- [Revised assignment audit](docs/MIDTERM_ASSIGNMENT_AUDIT.md)
- [Build, play, and test](MIDTERM_README.md)
- [Playable package and resource verification](docs/RELEASE.md)
- [Executable player](docs/PLAYER.md), [evaluation status](EVALUATION.md), and [agent-team draft](AGENT-TEAM.md)
- [Declared situations](docs/SITUATIONS.md) and [October 21 checkpoint evidence](docs/evidence/checkpoint-20261021.md)
- [Peer notes (pending)](docs/PLAYTEST.md) and [recording plan (video pending)](docs/DEMO_OUTLINE.md)
- [Module todo list and GitHub evidence](docs/IMPLEMENTATION_TODO.md)
- [Configuration](docs/CONFIGURATION.md), [agent-team log](docs/AGENT_TEAM_LOG.md), and [independent review](docs/evidence/independent-review-20261019.md)
- [Submission route and dates](docs/SUBMISSION.md)
- [Midterm checklist](docs/MIDTERM_CHECKLIST.md)
- [Rules and sources](docs/RULE_SOURCE_MAP.md)
- [Player information/action boundary](docs/INTERFACE.md)
- [Browser play](docs/WEB_PLAY.md) and [developer controls](docs/DEBUG_TOOLS.md)
- [Mac handoff](MAC_HANDOFF.md)

Scope: level 1, original starting inventory, and an episode ending on death
or any original exit, matching the student's September 26 Week 3 proposal.
See [the scope record](docs/SCOPE.md). Final submission is **November 7, 2026,
11:59 p.m. America/New_York**. The October 21 brief requires one PR to
`columbia-university-ai-games/game-dev-f26`, containing the complete project in
`midterms/demonrain7/` plus its single workflow. Submit that course PR URL;
the private development repo and candidate tag are historical evidence.
No midterm Asana links or private-repo staff invitations are required. Original
`.CA2` resources are required for play and remain outside Git; see
[asset provenance](docs/ASSET_PROVENANCE.md).

CI runs asset-free native rule/protocol, Python interface and release checks
on Linux/macOS, plus browser input and offline player/evaluation cases. It makes no
model calls and downloads no original resources. Real-resource integration is
an additional local check. CI does not establish full original-game fidelity
or an interactive playtest on the student's Mac.

[Course Draft PR #55](https://github.com/columbia-university-ai-games/game-dev-f26/pull/55)
is the active submission branch. Continue work here with incremental commits.
The project's four hosted CI jobs passed; the shared minigame boundary check
rejects the midterm-required workflow path and needs a maintainer disposition.
See [the recorded CI result](docs/evidence/course-ci-20261021.json). This remains
a draft, with live comparison, resources for recipients and human evidence pending.

## Run from the course folder

Start at `midterms/demonrain7/` in the course checkout; all commands below use
that working directory. In the historical standalone repo, use its root.
The project keeps its own dependency manifests and GPL license.

On macOS, install the Xcode command-line tools, CMake, SDL2, Python and uv.
With Homebrew available:

```bash
brew install cmake sdl2 python uv
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build --parallel 2
ctest --test-dir build --output-on-failure
uv sync --frozen
uv run --frozen python -m unittest discover -s tests -p 'test_players*.py' -v
```

Linux needs a C compiler and SDL2 development package. Windows needs an MSVC
developer shell and `-DSDL2_DIR="PATH/TO/SDL2/cmake"`; use `build/catacomb.exe`
instead of `build/catacomb` below. More platform details: [build guide](MIDTERM_README.md).

Gameplay requires four original files supplied separately in ignored
`data/original/`: `SOUNDS.CA2`, `EGACHARS.CA2`, `EGAPICS.CA2`, `LEVEL1.CA2`.
No redistribution permission for these resources has been established. The
public source builds and its deterministic tests run without them; a reviewer
cannot play from this checkout alone. Recipient resource access remains an
explicit Draft PR limitation, documented in [provenance](docs/ASSET_PROVENANCE.md).

```bash
uv run --frozen python scripts/verify_assets.py --data data/original
uv run --frozen python scripts/catacomb_env.py --exe build/catacomb --data data/original --human
uv run --frozen python scripts/serve_web.py --exe build/catacomb --data data/original --player-only
```

Run the last two commands separately. Native controls: arrows move, hold/release
Ctrl to charge/fire, Alt strafes, P/Space heals, B casts a bolt, N/Enter casts a
nuke. The browser prints its local URL, supports WASD/arrows and J for charge/fire,
and has no audio. Do not give the developer/debug interface to a playing agent.

The following development-case episode uses no paid model and creates a new
output directory. Choose a new directory name for each attempt:

```bash
uv run --frozen python scripts/run_episode.py --exe build/catacomb --data data/original --output runs/s1-baseline-001 --config config/midterm-v2.json --situation s1-entrance --policy baseline --seed 201
uv run --frozen python tests/test_live_game.py --exe build/catacomb --data data/original
```

For live play, configure the selected Vertex provider and Application Default
Credentials as described in [PLAYER.md](docs/PLAYER.md). Recheck its prices/access
before spending. Then use the same episode command with `--policy current` or
`--policy history`, and a fresh output directory. The full matched suite command
is in [EVALUATION.md](EVALUATION.md); held-out cases are reserved for the frozen
evaluation, not iterative tuning. Failed requests remain recorded and accounted
for at the configured estimate when usage is unavailable; this is not a bill.

The required 3–5 minute autonomous-model recording and actual peer observations
are **pending**. A scripted acceptance clip is not that recording. See the
linked forms above and [completion plan](docs/MIDTERM_PLAN.md).

## Upstream README and attribution

The following description is retained from
[Blzut3/CatacombSDL](https://github.com/Blzut3/CatacombSDL).
Course changes start from commit `473d13629a2350e2498dd4a158e5bd0b36184160`.

### CatacombSDL

CatacombSDL is a source port for The Catacomb (also known as Catacomb II). This
port compiles for Windows, OS X, and Linux for 32 and 64-bit X86. The only
dependency is SDL 2.0 and CMake. Supported compilers are GCC, Clang, and MSVC.

It is released under the GNU GPLv2. Please see COPYING for license details.

The source port is a drop in replacement for the DOS binary, and maintains full
compatibility with the DOS game files (demos, saves, and configuration). This
brings about a few limitations most obvious in control configuration. For
example, keyboard binds must correspond to a DOS scan code and joystick support
is limited to 2-axis and 2-buttons.

Also note on case sensitive file systems, this port currently requires that the
game data files (*.CA2) be in all upper case.
