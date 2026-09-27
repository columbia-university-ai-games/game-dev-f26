# AI in Practice: Game Design and Development

Student starter for COMS E6998 section 014, Fall 2026, a graduate-level course
that also admits undergraduates under the stated enrollment policy. The
syllabus on CourseWorks governs assignments. This starter contains an original
three-room game, **The Garden Door**, an optional model narrator, tests and
the Setup Verification workflow. It contains no Infocom source or assets.

The game runs offline. The setup diagnostics can also check your chosen
provider's live-model access and manually authorized live CI. The instructor
must verify student access to the repository before assigning the fork workflow.

**Setup preparation:** aim for offline readiness by September 18: environment,
a running game, Git/gh access, local tests and deterministic CI. University
Google credits and individual Google Cloud projects begin September 21;
aim for live readiness by September 28. Setup has no separate grade or
verification submission. Report access delays for instructor support and
continue the reflection and design work; optional purchases are unnecessary.
The diagnostic's “Setup Verification” labels describe technical check results,
not a separate course assignment. Project tests and live evaluations remain
required evidence for the midterm and final.

## Course choice and this example

Quick navigation: [Setup](#1-prepare-this-examples-environment) ·
[Play](#2-play-and-inspect-the-boundary) ·
[Model providers](#3-choose-a-live-model-provider) ·
[GitHub Actions](#4-verify-your-fork-in-github-actions) ·
[Project progression](#5-carry-this-into-the-projects) ·
[Troubleshooting](#troubleshooting)

Use any language and engine/framework for your course project. This repository
is one Python/Pyxel example; its installation and engine checks apply to this
example. Equivalent projects may use Three.js, Babylon.js, PlayCanvas or other
tools. No particular engine is taught. The course focuses on making great
games through agentic engineering. By term end, you will have agents covering
every game-development role while always serving as Executive Producer and
Creative Director. You retain vision, scope, priorities and acceptance
of work; your agents have bounded responsibilities and reviewable evidence.

For another stack, document runtime/dependencies and setup/play/test commands.
Show Git/gh access, a running game locally, one live model call, and meaningful
tests passing locally and in GitHub Actions. Submit the same evidence links.
You do not need Python or Pyxel to meet those requirements in another stack.

Cloudflare is taught for publishing and AI workers. Obtain instructor
permission before using another deployment platform; demonstrate equivalent
credential handling, state isolation, evaluation, limits and fallback.

## 1. Prepare this example's environment

Install Python 3.11 or later, Git, the GitHub CLI and uv. Use the official
[Python](https://www.python.org/downloads/), [Git](https://git-scm.com/downloads),
[GitHub CLI](https://cli.github.com/) and
[uv](https://docs.astral.sh/uv/getting-started/installation/) instructions
for macOS, Windows or Linux. Run the following in your terminal:

```sh
gh auth status
python --version
git --version
gh --version
```

If `gh auth status` confirms you are logged in to GitHub.com with the intended
account, keep that existing login. If you are not logged in or the credentials
are invalid, authenticate and check again:

```sh
gh auth login
gh auth status
```

Use `python3` if your installation exposes that name. After the instructor
confirms repository access and enables forking, fork and clone it:

```sh
gh repo fork columbia-university-ai-games/game-dev-f26 --clone
```

If forking is unavailable, contact the instructor. Private-repository forking
depends on both organization and repository policy; logging in again will
not resolve a policy restriction. Do not change repository visibility to
work around it.

Open a terminal **inside your cloned folder** for all remaining commands:

```sh
uv sync --frozen
uv run --frozen python -m unittest discover -s tests -v
uv run --frozen python -m course_game.setup_check --offline --headless
uv run --frozen python -m course_game
```

Offline diagnostics explicitly report partial Setup Verification. The
fixture is scripted text, not a live model or a recording of one. Neither
tests nor the setup check make commits or push code.

To verify a visible game-engine window on your laptop:

```sh
uv run --frozen python -m course_game.engine_check
```

The Pyxel window draws a frame and closes after about a second. Headless CI
initializes the same engine and checks a drawn pixel without a window.

## 2. Play and inspect the boundary

Commands: `look`, `east`, `west`, `take key`, `unlock door`, `north`, `quit`.
The winning path is east, take key, west, unlock door, north. Inspect
`course_game/world.py` to see why skipping the key does not work.

Use `ask look` to ask the narrator about the visible room, or `ask what is
behind the door?` to ask something it has not observed. Compare its answer
with the supplied facts. Valid JSON and valid fact IDs do not guarantee
truthful narration. Game actions remain deterministic even if the narrator
makes a mistake.

## 3. Choose a live model provider

Use Gemini through Vertex AI, an Anthropic model, or an OpenAI model.
The course-funded default is Vertex AI. Other providers are equally eligible;
you only need **one** working live provider. Choose a model that supports the
adapter's structured JSON output and fits your budget. The starter has no
hard-coded billable model and never silently switches providers or models.

The build assistant you use to develop code and the model your game calls
are independent choices. Configure runtime API access separately from your
coding assistant. Do not assume course Google credits cover another provider.

All live providers require `COURSE_MODEL`, set to your chosen API model ID:

| CLI provider | Additional local configuration | CI configuration |
|---|---|---|
| `vertex` | `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, Google Application Default Credentials | same variables plus `WIF_PROVIDER` and `COURSE_SERVICE_ACCOUNT` |
| `anthropic` | `ANTHROPIC_API_KEY` | Actions secret `ANTHROPIC_API_KEY` |
| `openai` | `OPENAI_API_KEY` | Actions secret `OPENAI_API_KEY` |

For Vertex AI, use your own course Google Cloud project, linked to your
eligible course-credit billing account. In Week 2, the instructor supplies
credit redemption and project-setup instructions, supported locations and
verified funded model options. Do not use another student's project. Install the
[Google Cloud CLI](https://cloud.google.com/sdk/docs/install). For an
approved individual account, local login normally uses
`gcloud auth application-default login`. An AI Studio key is a different
access path and does not establish eligibility for institutional credits.

For Anthropic or OpenAI, obtain authorized API access and load the selected
provider's key securely into your local environment. Never paste a key into
course submissions, terminal recordings, an Asana task or this repository.
The tracked `.env.example` documents names only; it is not loaded automatically.
An ignored local `.env` can be loaded with `uv run --env-file .env ...`;
keep it private and avoid exposing it during demonstrations.

Set non-secret settings in your shell, for example:

```sh
export COURSE_MODEL='YOUR_CHOSEN_MODEL_ID'
# Vertex only:
export GOOGLE_CLOUD_PROJECT='YOUR_COURSE_PROJECT'
export GOOGLE_CLOUD_LOCATION='YOUR_APPROVED_LOCATION'
```

PowerShell uses `$env:COURSE_MODEL = 'YOUR_CHOSEN_MODEL_ID'`, and the same
syntax for the Vertex variables. Select exactly one live path:

```sh
uv run --frozen python -m course_game.setup_check --provider vertex --headless
# OR:
uv run --frozen python -m course_game.setup_check --provider anthropic --headless
# OR:
uv run --frozen python -m course_game.setup_check --provider openai --headless
```

Interactive play accepts the same provider choice, for example
`uv run --frozen python -m course_game --provider openai`.
Omitting the play option uses the scripted fixture. Setup requires either
`--offline` or an explicit `--provider` before it runs any diagnostics.

The live check makes one inference request. Interactive play allows at most
five live attempts, counting failed requests. Each provider has a 20-second
HTTP timeout, automatic retries disabled, and a 1,024-token output cap.
These are request controls, not a guarantee of total wall-clock time or
monetary cost. Some models need a larger reasoning/output budget and may fail
this small check; choose a compatible model or document an intentional change
to the limits. No automatic paid retry or downgrade is performed.

Every adapter validates the same JSON shape and allowed fact IDs. Valid JSON
does not prove factual accuracy. Setup fails on errors, refusals, or unusable
output; interactive play displays authoritative game text on failure.
Reports contain provider, model identifier, latency and token usage.
Provider token categories and prices differ; totals alone are not a cost
comparison. Record dated pricing when estimating cost.

## 4. Verify your fork in GitHub Actions

Pushes and PRs run deterministic checks on Python 3.11 and 3.12, including
mocked adapter tests with no model traffic. Enable Actions on your fork if
prompted. Review and push a small README edit to trigger those checks.

After Week 2 funded setup, for the manual live check, set repository variable `COURSE_MODEL` to the
model for your selected provider, plus the provider-specific configuration
in the table above. API keys go in Actions **secrets**, never variables.
Only the selected provider's step receives its key.

Vertex CI uses GitHub OIDC and Google Workload Identity Federation.
The instructor must provision a trust policy restricted to approved student
repos and intended branches/workflows. No stored service account key is needed.
Other providers use their respective API secrets and do not require Google
Cloud configuration or authentication.

In Actions, select **Setup and deterministic checks**, choose **Run workflow**
on the trusted default branch, select your provider and enable `live`.
The live job is restricted to manual dispatch on the default branch.
Review workflow/code changes before running it with credentials.
PRs receive no model credentials. A skipped live job is not a live pass.

For your own readiness checks, confirm the game runs locally, deterministic
tests pass locally and in CI, and the selected live path succeeds when funded
access is available. Record provider/model information with project evaluations.
Setup reports can help diagnose access failures; no separate verification
submission is required. The instructor provides support for institutional
access delays. Offline checks require no paid calls.

## 5. Carry this into the projects

In Session 2, choose a classic game and a bounded reconstruction with clear
rules, source evidence and an ending or episode limit. Infocom is one sample
set; other classic titles and genres are encouraged. In Session 3, configure
your building agent team and define the observation/action interface for an agent
that plays the game. In Session 4, add a scripted or search baseline and
deterministic episode tests. In Session 5, compare a model-driven player with
that baseline, including its information and memory needs.

The midterm includes both a reconstructed game and an agent that plays it.
The starter's narrator demonstrates a model boundary; it is stateless and
does not select actions. NPCs and creative rewrites are optional. Self-play
fits competitive games; single-player games use a solver.

The Session 3 examples show one small agent team and one player interface
for The Garden Door. Build your own for your classic; these are references.

- `course_game/player_interface.py`: the five operations a playing agent
  uses (`reset`, `observe`, `legal_actions`, `step`, `outcome`), with a step
  limit and counted invalid actions. `tests/test_player_interface.py` runs
  the acceptance trace and the boundary checks.
- `docs/rule-source-map.md`: the rule and source map, every claim labeled
  with its evidence, plus the choices made for the playing agent.
- `AGENTS.md`: the implementation agent's standing instructions.
- `.claude/skills/rule-change/SKILL.md`: a reusable skill for changing a rule
  with a map row, a failing test first and a summary for review.
- `.claude/agents/rules-reviewer.md`: an independent, read-only review task.
- `agent-config.json`: the configuration record, now listing the three team
  members and the player interface.

The skill and reviewer are in Claude Code's native formats. The skill file
follows the Agent Skills format that several other assistants read. With
another assistant, give the reviewer's instructions to a fresh session that
did not write the change and has file editing turned off; record that setup
in your configuration. The player agent, episode runner and baseline come in
Sessions 4 and 5.

Use Asana for tasks, owners, acceptance criteria, dependencies, weekly PPP
and gate decisions. Link task URLs from PR descriptions and PR/CI URLs from
tasks. GitHub holds code and releases; CourseWorks holds grades and private
feedback. A completed task cannot approve a gate or merge a PR.

The later Cloudflare publishing/AI-worker foundation is a separate instructor-provided
teaching artifact. This starter does not deploy a service or create Asana
projects. The full course manifest records native artifact paths, policies,
failure modes, test commands and CI; native plugin/skill formats stay distinct.

## Key files

| File or folder | Purpose |
|---|---|
| [course_game/world.py](course_game/world.py) | Authoritative rules and state |
| [course_game/narrator.py](course_game/narrator.py) | Optional provider adapters and shared validation |
| [course_game/setup_check.py](course_game/setup_check.py) | Explicit offline/live setup diagnostics |
| [course_game/engine_check.py](course_game/engine_check.py) | Pyxel example smoke check |
| [course_game/player_interface.py](course_game/player_interface.py) | The playing agent's observation/action interface |
| [docs/rule-source-map.md](docs/rule-source-map.md) | Rule and source map with evidence labels |
| [agent-config.json](agent-config.json) | Common agent configuration, agent team and limits |
| [.claude/](.claude/) | Example skill and independent reviewer |
| [tests/](tests/) | Deterministic rules and mocked-provider tests |
| [.github/workflows/setup-check.yml](.github/workflows/setup-check.yml) | CI and manually authorized live checks |
| [pyproject.toml](pyproject.toml) and [uv.lock](uv.lock) | Example dependencies and reproducible versions |
| [.env.example](.env.example) | Non-secret setup variable guide |
| [AGENTS.md](AGENTS.md) | Instructions for development agents |

## Troubleshooting

- **GitHub auth fails:** run `gh auth status` locally, then `gh auth login`.
  Never paste an access token into a report.
- **Engine import fails:** confirm `uv sync --frozen` succeeded and use
  `uv run --frozen`. A headless check does not verify your laptop's display.
- **Model configuration missing:** set `COURSE_MODEL` and the selected
  provider's credentials. Only Vertex needs a Google project and location.
- **Live request fails:** check the approved identity, enabled API, location,
  model access and quota. The check reports an exception type without dumping
  credentials or request content. Preserve the error category for support.
- **CI live job fails or skips:** check that it was manually requested on a
  trusted default branch and that the selected model and provider credentials
  are configured (plus OIDC trust for Vertex). Offline green checks cannot
  replace this evidence.

Reference documentation: [Pyxel](https://github.com/kitao/pyxel),
[Google Gen AI SDK](https://github.com/googleapis/python-genai),
[GitHub-to-Google authentication](https://github.com/google-github-actions/auth),
[Asana authentication](https://developers.asana.com/docs/authentication).

Provider references: [OpenAI quickstart](https://developers.openai.com/api/docs/quickstart),
[OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs),
[Anthropic Messages](https://platform.claude.com/docs/en/api/messages/create),
[Anthropic structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).
