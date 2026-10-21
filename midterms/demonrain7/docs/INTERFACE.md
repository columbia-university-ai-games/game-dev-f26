AI-use disclosure: On October 12, 2026, Codex implemented and documented this interface and ran its recorded checks.

# Player observation/action interface

## Five-operation situation adapter (v2)

`scripts/situation_env.py` adds the following trusted evaluator API on top of
the unchanged native v1 protocol. [Declared cases](SITUATIONS.md) pin exact
legal preparation prefixes, resource hashes and starting images. The player
does not receive this object, fixture, case labels or configuration paths.

| Operation | Behavior |
| --- | --- |
| `reset(seed)` | Close the preceding process, start a fresh level one, replay the selected case's ordinary input prefix, verify its state, and return its first PNG at player tick 0. The seed is recorded; it does not randomize the original map. The runner separately creates a fresh policy/context for every episode. |
| `observe(0)` | Return current PNG/HUD, status and relative player ticks; no simulation advance. Only integer player ID 0 is accepted. |
| `legal_actions(0)` | Return the static action schema plus the one-consumable constraint, or an empty object after termination. It never reveals map/inventory-dependent hints. |
| `step(0, Action(...))` | Validate before stepping; advance 1–32 native ticks, respecting the remaining tick allowance; invalid/post-terminal calls do not change the world. |
| `outcome()` | Return `state` (`ongoing`/`terminal`), `reason`, binary task `score`, player `ticks` and `actions`. Score 1 means the original level exit; HUD score is not exposed or used. |

Terminal reasons are `cleared`, `dead`, `tick_limit`, `action_limit`,
`operator_stop`, or an explicit runner stop such as `provider_error`,
`harness_error`, `wall_time_limit`, `call_limit`, `token_limit`, `spending_limit`,
`provider_usage_exceeded_reservation`, or `invalid_action_limit`. `finish(reason)`
is evaluator-only and cannot award a clear. Native death/exit wins over a cap
on the same action. After a cap the public status is `truncated`; the outcome
preserves the exact reason. Observe remains available after termination.

Preparation actions/ticks are not player actions, token history or player time.
The runner logs native start/end ticks and the separate player clock. At the
prepared start, current and history policies both receive exactly one image.
Total elapsed time still includes initialization/preparation. Use
`--config config/midterm-v2.json --situation s1-entrance` with `run_episode.py`.
The earlier config and native adapter remain available to reproduce v1 evidence.

The following sections document the underlying **native v1** protocol.

## Responsibility and boundary

The trusted harness starts a fresh native process and owns the executable, assets, level selection, tick budget and logs. A playing model should receive only `Observation.png`, the documented episode metadata, and the permitted action schema. Register only observe/act as its game tools. Do not give that model filesystem, shell, debugger, source-retrieval or harness-configuration tools.

The adapter returns pixels from the existing framebuffer. It does not return coordinates, map arrays, enemy lists, random state, future spawns or solutions. Native input is an allowlist and clears local key state before the player's control is sampled; menu, save/load, warp and cheat commands are unavailable through the protocol. Closing the SDL window is still an operator action.

**This API is not an OS sandbox.** A coding agent that also has access to the repository or native process can inspect internals. The model host uses a separate context and tool set in `scripts/vertex_player.py`
and `scripts/player_contract.py`; no remote tools are registered. Its first image
request failed reauthentication, so successful live game play remains unverified. Keep trace paths and local asset directories outside player messages.

## Native protocol

Launch from a directory containing the required original data:

```text
catacomb windowed 640 400 --agent --headless --level 1 --max-ticks 10000 --frame-file /absolute/path/frame.bmp
```

The process writes one JSON response per request to stdout, with one initial observation on startup. It updates the BMP before returning its metadata. Send one request at a time. `--headless` uses SDL dummy video/audio drivers and a software renderer, with no visible window or speaker output; it requires `--agent`. The Python adapter enables it by default. Use `--show-window` with the Python CLI to opt into a visible agent run.

```text
observe
step D FIRE STRAFE POTION BOLT NUKE TICKS
quit
```

| Field | Meaning |
| --- | --- |
| D | 0 north, 1 east, 2 south, 3 west, 4 northeast, 5 southeast, 6 southwest, 7 northwest, 8 neutral |
| FIRE | 0 or 1; hold to charge, release to fire under the original rules |
| STRAFE | 0 or 1; keep the current facing while moving |
| POTION / BOLT / NUKE | 0 or 1; at most one is permitted per action |
| TICKS | Integer 1–32; advance this many simulation ticks unless the episode ends earlier |

Consumables are attempted once when the original player routine samples that action. If a short action ends while the player is in a delay state, that input may never be sampled; do not treat a request as proof an item was consumed. The original inventory and healing rules determine whether the request has any effect.

Example, charge briefly and release:

```text
step 8 1 0 0 0 0 16
step 8 0 0 0 0 0 8
```

Example observation:

```json
{"protocol":1,"status":"running","ticks":25,"width":320,"height":200}
```

Status is `running`, `dead`, `cleared`, `stopped` or `truncated`. `cleared` means leaving the selected level, including a warp/secret exit; it does not mean completing all 30 levels. A tick cap produces `truncated`, not a win or death. Death/level completion takes precedence over the cap on the same tick.

Invalid requests return `{"error":"invalid_command"}` without advancing the simulation. A step after termination returns `{"error":"episode_finished"}`. Observe remains available. There is no player reset command; the trusted harness closes and recreates the process for another episode. Quit/EOF exits without a final observation. A timeout is a harness error, not a game loss.

## Timing and information

Agent mode starts with one neutral simulation tick so the first image contains the drawn player; the initial tick counter is therefore 1. The simulation pauses while waiting for a command. Each step uses the original update order, movement cadence, enemy logic, collision rules and drawing routines. `observe` does not advance the world. Audio is still local SDL output; it is **not** included in the model observation in v1.

This is a stepped evaluation environment, not a claim of real-time human-equivalent performance. Any future baseline and model comparison must use the same observation format, available actions, tick cap and timing rules. Record model latency and cost separately. The ordinary human mode still runs in real time. An initial neutral tick, frame batching and loss of audio need to be disclosed in the scope/evaluation record.

## Python usage

From a trusted Python harness (Python 3.9+):

```python
from pathlib import Path
from scripts.catacomb_env import Action, CatacombEnv

with CatacombEnv(Path("build/catacomb"), Path("/path/to/original/data"),
                 Path("runs/example-001"), level=1, max_ticks=1000) as env:
    observation = env.initial
    observation = env.act(Action(direction="east", ticks=8))
    # Deliver observation.png bytes, status and ticks to the player.
    # Choose the next action from those observations only.
```

Use `build/catacomb.exe` on Windows. The run directory must be new to avoid overwriting evidence. The wrapper converts the original BMP into PNG, saves immutable numbered frames, logs commands/results, and stores executable and resource hashes for the trusted evaluator. No hidden game state is added during conversion.

The command-line smoke test exercises a few fixed actions; it is not a model player or a meaningful game-playing baseline. Real process-to-Python checks now pass with the original level-1 assets, including deterministic repetition, invalid input, charging/release, missing resources and a terminal tick cap. See `tests/test_live_game.py` and `docs/VALIDATION.md`. A complete first-level acceptance replay now exists; see `docs/evidence/level1-acceptance-20261019.json`.
Original-DOS equivalence and successful live model play remain distinct unverified claims.
