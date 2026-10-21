AI-use disclosure: Codex implemented and tested the player modules under the student's direction. Live outcomes are reported separately from offline fixtures.

# Executable player and baseline

**Assignment update:** use phases P1/P2/P4 in [MIDTERM_PLAN.md](MIDTERM_PLAN.md) before the final comparison. The current five-seed configuration is preliminary; the final suite needs distinct situations and held-out cases. Course delivery moves the complete project into `midterms/demonrain7/`; keep commands relative to that project directory.

The trusted runner starts the original level with fresh inventory and debugging
disabled. The remote Gemini model receives only rendered PNGs, status/ticks,
public controls and a bounded history when selected. It has no callable tools,
filesystem access, source retrieval, map access or reset operation. The local
runner holds paths and credentials; it never sends those to the player. This
boundary is an API/context restriction, not a general OS sandbox.

## Install and run

Install Python 3.11+ and [uv](https://docs.astral.sh/uv/). Build the native engine
using `MIDTERM_README.md`, obtain the original resources as described there, and
run the commands from this repository root:

```sh
uv sync --frozen
uv run --frozen python -m unittest discover -s tests -p 'test_players*.py' -v
uv run --frozen python scripts/run_episode.py --exe build/catacomb --data data/original --output runs/baseline-001 --policy baseline
```

On Windows use `build-checkpoint/catacomb.exe` for the existing checked build,
or the path to a fresh Windows build. Every output directory must be new.

For Vertex, enable its API in your own authorized Google Cloud project, use
`gcloud auth application-default login`, set the ADC quota project, and set
`GOOGLE_CLOUD_PROJECT`. Credentials stay outside the repository. The configured
global model is `gemini-3.5-flash-lite`; this course account previously passed a
text connectivity test. That earlier check is not evidence of image-based play.

```sh
uv run --frozen python scripts/run_episode.py --exe build/catacomb --data data/original --output runs/current-001 --policy current
uv run --frozen python scripts/run_episode.py --exe build/catacomb --data data/original --output runs/history-001 --policy history
```

The October 19 first image-player attempt was stopped by Google's reauthentication
requirement before any game action. It is recorded as `provider_error`, with
unknown usage conservatively reserved, rather than as a model-playing result.
Refresh the existing authorized login before retrying. Never commit ADC files,
authorization codes, access tokens, `.env`, or private error logs.

## Policies

| Policy | Decision input and behavior |
| --- | --- |
| `baseline` | Screenshot-derived floor/wall grid and health/charge bars; approximate visual motion; frontier exploration; charged shots, health-triggered potions and visible-threat nukes. Tie breaking uses a recorded seed. |
| `current` | Current screenshot/status/ticks and fixed rules/action schema. No previous screenshots, action log or persistent notes. |
| `history` | The same model/settings/rules plus the last three screenshot/action/intent records, followed by the current screenshot. Old entries are evicted; each episode starts empty. |

The baseline reads pixels, not level resources, engine coordinates or debug
state. Its internal navigation memory is an estimate accumulated from its own
observations, not a known map. Its palette classifier can misread doors, objects
and unusual terrain, and motion is ambiguous in open areas. It is a useful
scripted comparator, not an optimal policy. The memory experiment compares the
two model policies; it does not claim the baseline has the same internal memory.

`scripts/record_acceptance.py` and `config/acceptance-route.json` are privileged
acceptance aids and are never loaded by any evaluated policy. Their success
does not establish baseline or model success.

## Limits, failures and evidence

`config/midterm.json` records model/settings, prompt path, rate source and all
limits. Initial episodes allow 80 actions, 2,000 ticks, 80 generation attempts,
1,000,000 accounted tokens, 900 seconds and $0.30 estimated use. Requests time
out after 30 seconds, with SDK retries disabled. The wall-time check can be
exceeded by one in-flight request; no further game action is taken afterward.

The budget reserves 32,768 input tokens and 512 output tokens before a request.
The request contains at most four 320×200 images and bounded metadata. Reported
usage replaces the reservation; output includes thinking tokens. Missing usage
retains the full estimate, and a provider-reported overrun stops the episode.
Rates are the checked global standard uncached rates, with no assumed cache
discount or credit offset. These are conservative application estimates, not a
Cloud billing cap or invoice.

Invalid JSON, extra fields, wrong types, unsupported directions and conflicting
consumables are rejected before engine input. Rejection consumes a model call
but no simulation ticks. Two consecutive invalid responses stop the episode.
Timeouts and provider errors fail closed: the world stays paused and the run
ends. The runner never quietly substitutes a replay or another playing policy.

Every exit retains the last confirmed frame, including call/token/spending
stops and provider usage overruns. Failed native actions are labeled unconfirmed.
Provider construction errors and engine startup errors have distinct causes.
Cleanup failures are recorded separately without erasing known outcomes or
accounted cost; both cleanup operations are still attempted.

Each run saves `result.json`, `evaluation-config.json`, `decisions.jsonl`, original
frame PNGs, native traces and executable/resource hashes. Decisions identify
the exact context frames by SHA-256. Latency, actual model version, known usage,
rejections and unsuccessful attempts are retained. Local exception details stay
in ignored run directories. A unique-frame count measures image change, not map
coverage, skill or learning. No self-play learning is implemented or claimed.

## Module tests

The offline suite checks hostile/malformed action rejection, memory eviction
and reset, reservation/accounting, pixel-based obstacle reactions, a successful
terminal path through a fake environment, forced invalid outputs and timeouts,
and the actual SDK request's lack of tools. Fixtures are explicitly marked and
make no network calls. Hosted CI runs these in a locked Python environment on
every PR, alongside the native and browser suites.
