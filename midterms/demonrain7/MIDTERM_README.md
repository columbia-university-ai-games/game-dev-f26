AI-use disclosure: Codex adapted the source port, ran the recorded checks, and updated these instructions through October 19, 2026.

# Catacomb II: build, play and evaluate

This project adapts [CatacombSDL](https://github.com/Blzut3/CatacombSDL/tree/473d13629a2350e2498dd4a158e5bd0b36184160), retaining its C/SDL2 simulation and original resource format. Browser play forwards controls to the native process and displays its rendered frames.

## Current checkpoint

- Scope: original level 1 and starting inventory; death or any original exit ends the episode, matching the student's Week 3 proposal. See [SCOPE.md](docs/SCOPE.md).
- Repaired Windows binary-resource loading, startup argument scanning, and warp-number parsing.
- Added headless execution, bounded actions, pixel observations, and trace logs.
- Added an authenticated browser interface and explicitly enabled developer tools.
- Added a screenshot-based baseline and bounded Vertex player; see [PLAYER.md](docs/PLAYER.md).
- Recorded a complete 303-action level exit, five baseline episodes and an independent review with three corrected failure-path bugs.

The old fixed demonstration and privileged acceptance route are separate from
evaluated policy performance. Live model play remains blocked by Google sign-in.
For the prebuilt Windows candidate see [RELEASE.md](docs/RELEASE.md); for all
remaining requirements see [the checklist](docs/MIDTERM_CHECKLIST.md).

## Original resources

Keep original data in the ignored `data/original/` directory. Level 1 requires `SOUNDS.CA2`, `EGACHARS.CA2`, `EGAPICS.CA2`, and `LEVEL1.CA2`. The Windows copy contains all 30 levels, but that does not establish their correctness. Transfer your existing local resources to your Mac separately from the source checkout.

Upstream copyright and `COPYING` are preserved. Original data redistribution permission has not been established. Raw resources and rendered game images are excluded from Git; see [provenance](docs/ASSET_PROVENANCE.md).

Verify your copies with `python scripts/verify_assets.py --data data/original`.

## Build

On macOS, prepare Xcode command-line tools and Homebrew:

```bash
brew install cmake sdl2 python
bash scripts/build-macos.sh
```

On Linux with a C compiler, CMake, Python 3, and SDL2 development files:

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build --parallel
ctest --test-dir build --output-on-failure
```

On Windows, use an MSVC developer shell with CMake, Ninja, and SDL2:

```powershell
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Debug -DSDL2_DIR="PATH/TO/SDL2/cmake"
cmake --build build
ctest --test-dir build --output-on-failure
```

The existing Windows SDL2 installation is under `.tools/SDL2-2.32.10/`. Add `-DCATACOMB_TEST_DATA="ABSOLUTE/PATH/TO/data/original"` to register real-resource integration with CTest. Keep Debug enabled so native assertions run. Build locally on each operating system; do not copy Windows build caches to a Mac.

## Run

From the project folder `midterms/demonrain7/` (use `python3` on macOS/Linux):

```powershell
# Fixed headless interface demonstration; no visible window.
python scripts/catacomb_env.py

# Interactive play when ready for keyboard and speaker use.
python scripts/catacomb_env.py --human
```

The launcher prepares the required working directory. Use `--data "PATH/TO/DATA"` for another resource location. Platform launchers are `play-windows.cmd` and `play-macos.command`.

Original controls: arrow keys move; hold Ctrl to charge and release to fire; Alt preserves facing while moving; P/Space uses a potion; B uses a bolt; N/Enter uses a nuke. Esc begins the exit flow. Human input, audio, and complete level traversal need an actual playtest on the student's machine.

## Browser play and developer tools

```powershell
python scripts/serve_web.py --exe build/catacomb.exe --player-only --share
```

Use `build/catacomb` on macOS/Linux, or `build-checkpoint/catacomb.exe` for the
existing Windows Debug build. Open the printed `REMOTE_PLAY_URL` on your Mac.
Keep its key private. Windows must remain running and connected; the temporary
URL and key change on restart. `--player-only` blocks debug sessions. The browser
has no audio, and latency/batched actions affect timing. See [WEB_PLAY.md](docs/WEB_PLAY.md).

[Developer tools](docs/DEBUG_TOOLS.md) require a new session explicitly enabling debug mode and a separately built executable. They can inspect hidden state and change runtime values, so the owner interface must never be given to an evaluated player. Ordinary sessions disable debug tools. Debug mutations change the process rather than original resource files.

## Reproduce checks and evidence

```powershell
ctest --test-dir build --output-on-failure
python tests/test_live_game.py --exe build/catacomb.exe --data data/original
python scripts/record_week4_demo.py
```

On macOS/Linux use `python3` and `--exe build/catacomb`. Do not duplicate the integration test if CTest already ran it without a new reason.

The recording script creates a fresh ignored `runs/week4-.../` directory with PNGs, `trace.jsonl`, `configuration.json`, `demo.json`, and stderr. The October 12 demonstration contains nine frames and ends at tick 177 with status `running`. It is not a completed level or the required 3–5 minute video. Text summaries are committed under `docs/evidence/`; images stay local.

[Course checkpoint CI](../../.github/workflows/midterm-demonrain7.yml) checks native rules/protocol, Python data isolation, and mocked browser input. It requires no original resources or model credentials. Actual CI results, local real-resource tests, fidelity comparisons, and human playtests are different kinds of evidence.

## Player boundary and remaining work

The API returns the current 320×200 image/HUD, status, and tick count. It omits map arrays, coordinates, hidden enemies, and debug state. Actions last 1–32 ticks; the world pauses between them. The first image includes one neutral tick, and audio is omitted. Model and baseline conditions share these rules.

This API is not an OS sandbox. The separate model host supplies only allowlisted
observations and validated actions, with no registered remote tools. See
[INTERFACE.md](docs/INTERFACE.md) and [CONFIGURATION.md](docs/CONFIGURATION.md).

Run/evaluate the implemented policies using [PLAYER.md](docs/PLAYER.md) and
[EVALUATION.md](docs/EVALUATION.md). Remaining evidence includes live image-model
trials on a declared three-situation suite with held-out cases, actual peer
participation, student-authored reflection and the presentation. The [revised
assignment audit](docs/MIDTERM_ASSIGNMENT_AUDIT.md) governs remaining work;
final submission is November 7, 2026, at 11:59 p.m. America/New_York.
Track current candidate/publication status in [IMPLEMENTATION_TODO.md](docs/IMPLEMENTATION_TODO.md).
