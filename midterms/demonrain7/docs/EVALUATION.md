AI-use disclosure: Codex implemented the evaluation runner and prepared this protocol under the student's direction. Only recorded runs count as results.

# Preliminary comparison protocol and results

**Revised-assignment status, October 21:** this document/configuration preserves
the original five-seed, single-start study. It is not the final three-situation
suite required by [assignment 1749857](https://courseworks2.columbia.edu/courses/258228/assignments/1749857).
Policy seeds do not create different starts. P1 must declare distinct situations
and held-out cases before further tuning; P4 normally runs two trials per
situation for baseline, current and history. Do not spend the remaining live
budget on this old plan as if it completed the new requirement. See
[MIDTERM_PLAN.md](MIDTERM_PLAN.md). Final delivery needs
`midterms/demonrain7/EVALUATION.md` in the course PR, including all required metrics
and student-authored limitations. The old configuration and results remain unchanged.

The question is whether three prior visual observations with their actions and
short intentions help the same model play the original first level compared
with seeing only the current image. A screenshot-based scripted explorer is
the external comparator. None of these policies learns across episodes.

## Frozen conditions

`config/midterm.json` and `prompts/player.txt` define the initial experiment.
Use five seeds, 101–105, for each of `baseline`, `current`, and `history`.
The baseline runs first; the model conditions alternate order within each seed.
Each episode starts level 1 with original inventory and an empty policy memory.
The original map is fixed; a seed affects the baseline's tie breaking and the
model request, not map generation. Provider seeds do not promise identical responses.

All policies use the same screenshot/action interface and maxima: 80 actions,
2,000 game ticks and 900 seconds. Individual actions can take 1–32 ticks;
the baseline chooses eight. Therefore equal action ceilings do not guarantee
equal elapsed simulation time. Model calls additionally have the token,
request, invalid-response and spending ceilings documented in [PLAYER.md](PLAYER.md).
Current/history conditions differ only in the permitted recent context.
The baseline's own estimated navigation memory is not the memory ablation.

Do not change code, prompt or settings within a suite. The manifest records the
Git revision, source/prompt/dependency hashes, full configuration, ordered case
list and previous cost reservation. Each native episode records the executable
and original-resource hashes. If a later fix changes a policy, run a new suite
and retain the earlier evidence rather than silently replacing it.

## Commands

Install and authenticate using [PLAYER.md](PLAYER.md). From the repository root:

```sh
uv run --frozen python scripts/evaluate.py --exe build/catacomb --data data/original --output runs/midterm-suite-001
```

On Windows replace the executable with `build-checkpoint/catacomb.exe` or your
fresh build. Output directories must not already exist. The initial suite has
a $3 estimated ceiling, including earlier use supplied with
`--prior-estimated-usd`. All unknown request usage retains its full reservation.
This estimate is distinct from the Cloud invoice or credit balance.

The October 19 image-player pilot could not refresh Google credentials and
reserved $0.0111104 before any gameplay. While sign-in is unavailable, run only
the real baseline and explicitly record the missing model conditions:

```sh
uv run --frozen python scripts/evaluate.py --exe build-checkpoint/catacomb.exe --data data/original --output runs/m3-baseline-suite-01 --policies baseline --unavailable-reason reauthentication_required --prior-estimated-usd 0.0111104
```

After login, first complete a real image-player pilot. Freeze any necessary
changes before a new full suite; carry forward every earlier cost reservation.
Do not spend the full suite allocation repeatedly without accounting for prior runs.
A provider failure stops further model episodes in that suite. Unattempted
conditions remain in the result table with the reason, rather than becoming
invented model losses or successes.

A local harness failure stops the remaining suite with
`harness_unavailable_after_failure`; it is not attributed to the provider.

## Read the evidence

Each suite writes `manifest.json`, `results.json`, `summary.json`, and `REPORT.md`.
Attempted episodes include `result.json`, structured decisions, exact PNGs,
native trace, and configuration hashes. The report is regenerated after every
case so partial work remains inspectable. Original assets, game images, and
private exception logs remain in ignored local run directories; sanitized text
evidence can be copied to `docs/evidence/` for the TA.

Primary outcome: original exit reached before a limit, death, or failure.
Secondary outcomes: termination reason, actions, ticks, invalid actions,
request latency, known/reserved token usage, estimated cost, and model version.
Report unsuccessful attempts. Report current-versus-history differences only
after both conditions have real model actions. Five fixed-map repetitions are
small descriptive evidence; Wilson intervals do not establish generalization.
Changing screenshot hashes are not a measure of explored area.

The privileged acceptance route proves a complete ordinary-interface path is
possible. It is excluded from both the baseline and model comparisons. Offline
provider fixtures verify code paths and do not count as model gameplay.

## Module tests

```sh
uv run --frozen python -m unittest discover -s tests -p 'test_players*.py' -v
```

The evaluation tests verify case ordering, failed/unattempted denominators,
the descriptive interval, and preserving planned cases after provider failure.
See [IMPLEMENTATION_TODO.md](IMPLEMENTATION_TODO.md) for actual execution status.

## Recorded October 19 result

The [frozen baseline suite](evidence/baseline-suite-20261019/REPORT.md) contains
five real engine episodes at source revision `7768a49`. All reached 80 actions
and tick 641 alive; none cleared the level. All 400 decision PNG hashes matched
the retained local frames. Every episode used the same native binary and four
original resources, with debugging disabled. The sanitized native and decision
traces are committed beside the report.

The baseline therefore demonstrates valid visual interaction but limited
performance within this budget. It is not a solved-game baseline. Ten planned
model cases were left unattempted because reauthentication was unavailable;
the earlier failed provider pilot remains separately recorded. There is no
measured model-versus-baseline or history advantage yet.
