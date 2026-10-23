# 回声渔场 · Echo Fishery

Original, finite, single-player acoustic fishing game for COMS E6998 midterm. GitHub login: **Weihao-Zhou03**. The student is Executive Producer and Creative Director.

> Use sound to discover and arrange a fishing opportunity. Reeling creates new sound that can undo the plan. Decide what is worth bringing home.

## Play locally

Requires Node.js24 and npm. Every command below runs in **`midterms/weihao-zhou03/`** after cloning the course repository and checking out the PR branch. No model account or key is needed to play.

```powershell
npm ci
npm run dev
```

Open the printed local URL (normally http://127.0.0.1:5173). Choose A for a first voyage; the three-page 航行手册 explains sonar snapshots, delayed sound beacons, reeling and escape. Map positions are continuous; eight directions are controls, not tiles. Thinking time pauses the simulation. Harbor delivery is explicit: catching is not banking.

Keyboard: WASD/arrows select cardinal direction; 7/9/Z/C select diagonals. 1/2 quiet/rush while exploring; Q/E weak/strong sonar; B deploys the selected beacon; F casts. While hooked, 1/2/3 steady/strong/slack, X cuts and evades in the selected direction. Space waits. R returns while in harbor. Mouse buttons expose the same actions. Important sound cues also have visual/text equivalents.

## Verify and evaluate

All commands still run from **`midterms/weihao-zhou03/`**:

```powershell
npm test
npm run check
npm run build
npm run evaluate -- --player baseline --suite dev
npm run evaluate -- --player mock --scenario A --seed 101
npm run replay -- eval/runs/current-dev/<episode-trace>.json
```

Mock is an explicitly labeled offline transport diagnostic. It is not a model trial. `npm run build` writes ignored `dist/`; dependencies/build caches are not submitted. The course's scoped deterministic workflow is `.github/workflows/midterm-weihao-zhou03.yml` at repository root. It runs no model traffic and installs no secrets.

For a live compatible provider, set a non-browser environment variable for the key, then select the model explicitly. The submitted `.env.example` contains names/placeholders only; it is not automatically loaded. PowerShell example (key should already be set securely in the environment):

```powershell
$env:ECHO_API_BASE = 'http://127.0.0.1:8317/v1'
$env:ECHO_MODEL = 'gpt-6.1-sol'
npm run evaluate -- --player model-current --suite dev --repetitions 1 --max-calls 85 --live
npm run evaluate -- --player model-history --suite dev --repetitions 1 --max-calls 85 --live
```

Working directory remains **`midterms/weihao-zhou03/`**. ECHO_API_KEY is required and never exposed in the frontend or public traces. The local gateway is optional; another compatible base URL can be selected. No proxy binary, OAuth credentials, provider account or machine-specific auth file is part of the submission. Unknown monetary cost is reported as unknown; subscription quota is not represented as a verified zero-dollar API cost.

Do not use held-out trials for tuning. Freeze rules/config/prompt first; `eval/suite.json` declares3 situations and2 fresh trials per model condition, with current observation versus6-step public history. Cases711/823/947 are reserved. The model receives no source, seed, debug tools or hidden state. Baseline uses the same public observation/action contract.

## Scope and evidence

Included: one continuous bay, three mission presets, three distinct fish responses, one persistent sound-investigating predator, two beacon profiles/delays, sonar snapshots, rod fights, atomic cut/evade, finite night, partial return, sink/expiry, restart, Chinese tutorial and2.5D procedural visuals/audio. Excluded: multiplayer, real ocean physics, QTE, gear economy, persistent progression, reinforcement learning and live model calls from the human UI.

The scope is an **original game**, replacing an earlier proposed reconstruction. The student must also record this change in the original Week3 CourseWorks discussion thread; this repository does not claim that message has been posted.

- [Original rules and rationale](docs/DESIGN.md), [rule/source map](docs/RULES-SOURCE-MAP.md), [public interface](docs/INTERFACE.md).
- [Evaluation and limitations](EVALUATION.md), [declared suite](eval/suite.json), [runner instructions](docs/RUNNER.md).
- [Agent-team factual record](AGENT-TEAM.md), [independent review](docs/review.md), [runner skill use](docs/skill-use-runner.md), [UI skill use](docs/UI-NOTES.md).
- [Visual direction](docs/VISUAL-DIRECTION.md), [actual screenshot review](docs/VISUAL-REVIEW.md), [source/asset terms](ASSET-LICENSES.md).
- [Human/peer playtest notes — pending](docs/PLAYTEST-NOTES.md), [recording status](docs/RECORDING.md), [handoff/status](HANDOFF.md).

The code and evaluation do not replace the student's own agent-team reflection or actual peer feedback. This is a draft submission until the listed human-authored/peer/recording obligations are completed. Submit one course-repository PR URL to CourseWorks; student acceptance and merging are not performed by an agent.
