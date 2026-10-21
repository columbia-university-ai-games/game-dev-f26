AI-use disclosure: On October 12, 2026, Codex implemented the browser bridge, tested it with the native game, and prepared these notes.

# Catacomb II: remote browser play

For peer/course play use `python scripts/serve_web.py --exe PATH/TO/catacomb --player-only`
(add `--share` only when remote access is wanted). This hides the existing debug
button and rejects debug session creation at the server. The ordinary owner
mode described below still exposes developer tools when this flag is omitted.
The packaged browser launcher always supplies `--player-only`.

The native game runs without a visible window on Windows. A Mac or phone browser displays its frames and sends actions through the observation/action interface. An optional, default-off native debug extension is documented in [DEBUG_TOOLS.md](DEBUG_TOOLS.md). The original `.CA2` resources and old `build/catacomb.exe` are preserved; the new executable is in `build-debug/`.

## Start and connect

From the project directory:

```powershell
# Local access only
python scripts/serve_web.py

# Generate a temporary HTTPS link for another device
python scripts/serve_web.py --share
```

The local `.tools/cloudflared.exe` is already available. You can also launch `web-play-windows.cmd` yourself; it opens a terminal for managing the server. Close it or press Ctrl+C to stop. Automated checks ran in the background without opening desktop windows.

The launcher prefers `build-debug/catacomb` (`.exe` on Windows) when present, otherwise `build/`. Use `--exe` to select a binary explicitly. The current debug-capable server uses local port **8766**, separate from the earlier server on 8765. Use an available port for another instance. Debug features require a build containing `debug_tools.c`.

Copy the **complete `REMOTE_PLAY_URL`**, including `#access=...`. The page removes the key from the address bar after reading it, so save the original link from the server output when moving to another device. The key is held in process memory, startup output, and the tab's sessionStorage. The current hidden server's output is in the Git-ignored `.tools/web-debug-service.out.log`. Anyone with the full link has developer access, including the ability to create debug sessions. Do not give this key to a playing agent.

Windows must remain awake, online, and running the server. No sleep settings or startup tasks were changed. Sleep, disconnection, or server shutdown makes the link unavailable. Restarting generates a new address and key; this is not a permanent midterm submission URL. See [Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/).

The server listens only on `127.0.0.1`. Cloudflare Tunnel forwards HTTPS requests to this game service. No inbound firewall port, desktop access, file sharing, or remote terminal was enabled.

On another machine, obtain `cloudflared` from the [official download instructions](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) and place it in `.tools/`, or pass its path with `--cloudflared`. The installed Windows x64 version is 2026.10.0, SHA256 `86aee4017b26625cee8484c113558f48effa4cd47f7aa05fcf425604e5d2b23c`, previously checked against the official release digest.

## Controls

Click **Enter level 1** to begin.

| Action | Control |
| --- | --- |
| Move | Arrow keys / WASD |
| Charge and fire | Hold J, then release |
| Move without turning | Hold Shift while moving |
| Healing potion | P |
| Bolt spell | B |
| Nuke spell | N |
| Pause / resume | Esc or the page button |

On-screen buttons support mouse and touch. Losing focus or switching tabs pauses play. Restart closes the current session and starts a new one with its selected mode and level. **Restart with original rules** always starts normal level 1.

The October 12 input fix buffers both presses and releases while a request is pending, including short J taps. Inputs are sent in order as soon as the previous request finishes. Normal mode uses four ticks per input. Network latency can still produce a queue; exceeding 32 pending states pauses play and clears the queue. Pausing, losing focus, or disconnecting also clears pending inputs.

Click **Debug panel → Start debug session** for parameter editing. See the [debug guide](DEBUG_TOOLS.md) for ranges, presets, and restoring original rules. The page, dynamic messages, accessibility labels, and developer panel use English.

## Gameplay and timing

- **Normal rules:** original maps, graphics, collisions, enemy behavior, charging, projectile types, items, damage, death, and exits. The page displays 320×200 frames from the native renderer.
- **Coursework scope:** normal mode uses level 1, original starting equipment, and an episode ending on death or any original exit. Debug mode can load original levels 1–30; that does not change the level-one scope recorded in the student's Week 3 post; see `SCOPE.md`.
- **Stepped input:** normal browser play sends four-tick actions sequentially. Neutral actions advance the world while playing without a held key. Pause, blur, and disconnection stop further actions; an in-flight action may still finish.
- **Response time:** networking and frame conversion affect the effective simulation speed. Browser play has no audio and is not equivalent to local real-time keyboard play.
- **Session controls:** pause and restart belong to the human interface. Model players should use the restricted observation/action tools, not the browser's developer API.
- **Limits:** at most two concurrent sessions; normally 20,000 ticks per session; sessions expire after 15 minutes without an API request. Reaching the tick budget produces `truncated`, not death or success.

Formal model/baseline comparisons must use the same observations, timing, and budgets. The browser does not implement a model player, baseline, or the required evaluation by itself.

## Data and access boundaries

Only fixed HTML, CSS, JavaScript, and icon assets are public. Game API requests require the random access key. There is no file browser, source/resource download, or arbitrary command execution endpoint. Normal sessions return native frames, limited episode status, ticks, and sequence metadata; `/api/debug` is rejected.

Explicit debug sessions can also read the full map, coordinates, and values and execute allowlisted edits. For formal play, a trusted harness should create ordinary `CatacombEnv` instances and expose only `observe/act`. Keep `DebugEnv`, the browser key, filesystem access, and process-launch tools out of the player's environment.

The existing `Action` validator checks controls. HTTP handling additionally limits payload size and request origin. Actions carry sequence numbers; retrying an identical action does not apply it twice. Invalid actions and observation reads do not advance the simulation. Each session has separate resource copies and logs under `runs/web/`.

## Verification

On October 12, 2026, eight real-game HTTP integration tests passed: authentication, allowlisted routes, origin checks, invalid-action handling, duplicate handling, HTTP/native equivalence, terminal states, and session limits/closure.

For the equivalence test, the same initial state and six actions were sent through HTTP and the direct Python interface. All seven PNGs, tick counts, and episode states matched. This checks that sequence, not every mechanic or fidelity to the original DOS release.

Headless Chromium checks through local and public HTTPS links covered starting play, keyboard controls, pausing, focus loss, restarting, a 390px mobile layout, and touch controls. Reports had no JavaScript errors. Screenshots and results are in `runs/web-browser-check/`. Actual Mac/Safari and the campus network have not been tested.

The preserved old `build/catacomb.exe` has SHA256 `c9bda71676a73fae5fb3a13bff9bbbac41ae9c953eb66497f26969828cbdc098`. See [DEBUG_TOOLS.md](DEBUG_TOOLS.md) for the new binary and debug regression checks. SOUNDS, EGACHARS, EGAPICS, and LEVEL1 hashes match the earlier Week 4 records.

These are automated checks, not student or peer playtests. Temporary URLs and access keys are excluded from distributable documentation.

## Quick-tap regression

A browser test reproduced dropped short WASD taps by holding the previous request open. After adding an input queue and fixing the initial request's busy state, all six checks in `tests/test_web_input.py` passed: ordered WASD taps, two short fire presses and releases, hold/release, no sticky direction, clearing on blur, and on-screen button taps. These tests intercept every game API call and do not affect live sessions.

A separate real session over HTTPS confirmed that a 15 ms S tap entered during an in-flight request was delivered and changed the frame, with at most one action in flight. See `docs/evidence/web-input-fix-20261012.json` for that earlier snapshot. Static text updates are served without restarting the backend. Refreshing loads the latest page and returns to the start screen.
