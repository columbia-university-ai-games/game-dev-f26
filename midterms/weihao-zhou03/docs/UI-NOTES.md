# Browser implementation and contract-check evidence

Date: 2026-10-22 (America/New_York). Session role: renderer implementation subagent. This is implementation evidence, not an independent code review or a human playtest.

## Scope and files

The renderer session read the root and student `AGENTS.md`, `src/core/types.ts`, `docs/INTERFACE.md`, `docs/RULES-SOURCE-MAP.md`, the original user brief, and `docs/VISUAL-DIRECTION.md`. It created only `index.html`, `src/main.ts`, `src/style.css`, `src/renderer/sea.ts`, `src/renderer/audio.ts`, and this note. It did not change engine rules, runner, package manifest, or tests.

`SeaView` accepts `PublicObservation` values and a direction-selection callback. It does not receive a `GameInterface`, `WorldState`, or policy. Continuous world coordinates are mapped to x/z on an orthographic Three.js scene. Terrain, boat, lights, pier and water are procedural original geometry/shaders; no downloaded assets/fonts are used. HTML/CSS supplies the Chinese interface.

The UI includes A/B/C task selection, three-page field guide, eight directions, quiet/rush movement, weak/strong sonar, two beacon sounds with immediate/two-step delays, casting, three reel styles, one-step cut-and-evade, port delivery, terminal report and restart. Keyboard instructions are in the field guide. Public action trace export/import uses a separately labelled browser format (`echo-fishery-public-action-trace`) rather than pretending to be a live model trace. File import is size/shape bounded; every replayed action still goes through the core validator.

## Explicit reusable skill invocation

The implementation session invoked **`$game-contract-check`** by name and read `.agents/skills/game-contract-check/SKILL.md`. This is a distinct real task/session from the core implementation. Files checked: public types/contract/map and all browser files listed above, plus `src/core/game.ts` and public event construction in `src/core/simulation.ts` to verify consumption. These core files were read only.

Concrete checks/results:

- User input passes a string action ID to `game.step('human', { id })`; the renderer never changes hull, fish, cargo, phase, tick or outcomes.
- `renderControls()` reads `observe()` only. Failed actions do not animate successful movement or get appended to the accepted action trace.
- Fish progress and tension display the exact public numeric values on 0–100 scales. Current fish cue labels describe the next reel operation.
- The sea only draws public contact snapshots, public beacon locations, boat, reefs, harbor, public hooked line endpoint and announced attack capsule. No hidden fish/predator model, shadow, trail or lookup exists.
- Echo centers use `contact.position` directly. Their displayed ages use `observation.tick - contact.tick`; uncertainty uses public `contact.uncertainty`. No animation moves those centers or expires them with wall-clock time.
- Attack `width` is the segment hit **radius**. The rendered capsule has full breadth `2 * width` and circular endpoint caps, matching the engine distance-to-segment footprint. Time text uses public `resolvesIn`.
- Ocean waves, boat bobbing, interpolation and sonar expansion use animation time, but never invoke `step` or modify public state. Animation time/API latency cannot consume game steps. Pulse graphics are decorative and do not claim an unreported sensor boundary.
- Decision-relevant synthesized audio selects cues only from public events. Pan uses only an event's already-public position. Quiet mode remains fully playable through text and geometric cues.
- Browser imports only the core public facade/types and renderer modules. No API keys, model endpoints or runner private traces are accepted or rendered.
- Replaying an imported accepted action sequence invokes the same `createGame(seed, scenario)` and the same action validator; the browser makes no independent simulation decisions.

Actual verification in this session:

- `npm run build`: passed, TypeScript and Vite production output; 12 modules transformed. Vite reported a 561 kB uncompressed Three.js application chunk warning, not a build failure.
- `npm run check`: passed after UI integration and attack-width correction.
- The root agent is responsible for browser screenshot/interaction verification. The renderer session inspected the actual root-captured `docs/screenshots/first-playable.png` using `view_image` and received the separate visual agent's read-only `docs/VISUAL-REVIEW.md` findings. This was agent screenshot inspection, not human playtesting, independent rules review, live-model evidence, or a course gate approval.

## First screenshot correction

The initial 552 px in-app-browser screenshot exposed missing mobile ship status, undersized decision text and decorative wave highlights resembling sonar contacts. Corrections were implemented without changing rules:

- At widths <=650 px, a compact always-visible row now exposes hull, beacon inventory, cargo count and quota. An expandable **舱单与公开情报** section exposes task, boat coordinates/heading, cargo values, public contact snapshot coordinates/age/uncertainty, beacon position/profile/timing, announced threat geometry/timing, recent events and action trace controls. The data comes directly from the same observation. Expanding it changes layout rather than covering the map; open state is preserved after actions.
- Primary mobile action names are 14 px and descriptions 12 px. Key statuses and fight meters were enlarged. Mobile map stage was reduced from 52dvh to 45dvh (minimum 300 px) to free layout space while keeping the full map in view.
- The original high-contrast water points were replaced with low-contrast broken wave bands and correct output color conversion. They do not communicate hidden entities. Root screenshot verification of the correction is pending.
- `npm run build` passed again after these changes (12 modules, 565 kB uncompressed application chunk; same nonfatal bundle-size warning).

## Remaining verification

Root/browser checks should inspect 1440×900, 1280×720, exploration/fishing/terminal layouts, all control transitions, echo aging versus waiting, edge collision, and attack corridor escape. Human playtesting is still required to assess whether sound placement and fishing risk are enjoyable and understandable. Color/type/layout choices are implementation proposals pending that evidence.

The programmatic water/boat motion is decorative. A full reduced-motion rendering option, robust keyboard focus trapping for modal accessibility, and further bundle splitting remain possible improvements; no unsupported completion claims are made for them.

## Recorded model demonstration and local video export

The renderer implementation follow-up addressed the independent review's replay/menu finding: opening help or tasks now explicitly stops playback, preserves current state, and explains why. `submit` distinguishes a replayed action from modal-blocked human input. The interface never describes a menu interruption as rule incompatibility.

The task menu loads `public/model-demo.json` only when **模型实测回放** or **导出 3 分钟演示** is clicked. The root agent supplies that file from a real model episode; this renderer session did not write its actions. The loader validates bounds and required provenance fields, preflights every action through `createGame`/`step`, and compares declared terminal/reason/return/success/score values with the actual result before display. Missing or incompatible records fail visibly, without a fixture substitute. Token count can be provided directly or derived from public `inputTokens + outputTokens`.

Actual headless verification of the root-provided record: all 15 actions accepted for scenario A / seed 101; actual returned/success true, 2 delivered fish, score 64; token fields total 19,648. This is a deterministic replay check, **not** a new live model trial. The UI banner continuously says **真实模型已记录动作回放，非实时请求**.

`src/renderer/recording.ts` was implemented in a delegated renderer-only subtask and integrated here. It uses a new 1280×720 canvas, draws the visible WebGL sea plus public Chinese HUD, and captures only that canvas via `captureStream(24)`/`MediaRecorder`. It has 20 seconds of rules, a 130-second fixed schedule of the exact supplied actions through the real core, and a 30-second closing result/limitations section. Duration is 180 seconds. There is no screen capture permission, audio track, API request, secret input, alternative action policy, or hidden-state drawing. Encoding format prefers WebM and supports an MP4 fallback if required by the browser; the download extension matches the actual MIME type.

The recording button is explicit. During recording other game controls are blocked; cancel/Escape cleans up tracks, timers, listeners and frame rendering without exporting a partial recording. Switching the document into the background cancels instead of silently compressing all delayed actions into the last frame. Three.js uses `preserveDrawingBuffer: true` so `drawImage` can read the sea pixels.

Actual follow-up checks: `npm run build` passed with 13 modules and a 578 kB uncompressed chunk warning; `npm run check` passed after background-cancellation handling. A full 180-second encoded browser export remains for root/browser verification; neither module completion nor build success is claimed as an existing video artifact.
