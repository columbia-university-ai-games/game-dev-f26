# Public player and bounded evaluation runner

The browser baseline, CLI baseline and model player consume only `PublicObservation`. `src/players/baseline.ts` is a deterministic acoustic-window heuristic: search with sonar, navigate a public-map visibility graph, deploy a delayed chime near a fishing site, cast toward fresh public echoes, manage cue/tension/noise, escape an announced corridor, and reserve navigation time for an explicit return. Navigation estimates guide proposals; only the shared engine determines legal movement, fish and danger outcomes. The baseline is a credible reference policy, not a claimed optimal strategy.

`mock` deliberately runs that same local policy while labeling all steps `mock`. It is an offline runner diagnostic, never a live-model evaluation and never evidence of model ability.

```powershell
npm run evaluate -- --player baseline --suite dev
npm run evaluate -- --player mock --scenario A --seed 101
npm run replay -- eval/runs/dev/<public-trace>.json
```

Live calls use the user's explicitly selected local compatible provider. Set `ECHO_API_KEY` in the terminal outside this repository; do not place credentials in source, prompts, browser variables, screenshots or trace files. Do not read proxy configuration to obtain credentials. Defaults: base `http://127.0.0.1:8317/v1`, model `gpt-6.1-sol`; override through `ECHO_API_BASE` and `ECHO_MODEL`.

```powershell
npm run evaluate -- --player model-current --scenario A --seed 101 --repetitions 1 --max-calls 85 --live
npm run evaluate -- --player model-history --suite dev --repetitions 2 --live
```

The runner requires both `--live` and configured credentials. It never silently replaces a live condition with fixtures. Every HTTP attempt, including timeout, HTTP error and invalid JSON/action, consumes one call. Each action permits at most one repair; if unsuccessful, an explicitly labeled baseline fallback is recorded. Reaching the call budget stops the episode before another request. A final failed call may produce one recorded fallback action before that stop. API latency never advances world time. Default call timeout30 seconds, max85 calls per episode, max200 output tokens per request, max3 rejected actions and max100 runner attempts. CLI caps timeout30 seconds, calls85 and attempts200. The engine's finite night budget remains authoritative.

`model-current` creates a fresh two-message request containing static public rules and the latest observation. It has no conversation or prior observation history; repair adds only a validation instruction. `model-history` adds the last six accepted public observation/action pairs. Neither policy receives the game interface, private state, private debug logs, hidden seeds as clues, or results of future actions. The seed is recorded in the output trace for reproducibility, not included as a separate player input.

The registered suite in `eval/suite.json` predates tuning. Development is the default. Do not run held-out cases until rule implementation, configuration and prompt are frozen. A run against a held-out case exposes it; tuning afterward consumes the holdout and requires replacement cases. The runner records Git revision plus dirty status, prompt/baseline versions, seed/scenario/repetition, exact observations and submitted actions, source (`model`, `baseline`, `fallback`, `mock`), call outcomes and latency, usage where reported, terminal and runner stop reasons. It excludes API keys, HTTP response bodies and internal model reasoning. Cost is `null` because provider pricing/account usage is not reported; subscription calls must not be labeled free or priced at an invented rate. Aggregate token totals are `null` if any call has unknown usage.

Each episode JSON is a **public replay trace**. `replay` reconstructs the same shared engine, seed and scenario, submits the logged actions and compares every public observation and final observation. It derives the actual stop boundary instead of trusting `runnerStop`, rejects steps after engine termination or exceeded limits, checks call/source consistency and recomputes result metadata. Replay is deterministic consistency verification, not another live trial or cryptographic attestation of provider responses. Summary JSON labels live provider trials separately from deterministic baseline and offline mock diagnostics. Human experience testing remains separate and must be reported only after actual human play.
