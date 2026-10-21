AI-use disclosure: A separate Codex reviewer performed this review and correction check. Its report is reproduced below.

# Independent implementation review — October 19, 2026

This is an independent AI code review, not a human playtest, instructor approval, original-DOS fidelity certification, or evidence of successful live-model play. The reviewer did not implement the reviewed changes. Passing tests are reported separately from the confirmed findings below.

Reviewed revision: `fbe709e2c96227a1b472d32ddb6c9050c3e87314`, compared with `a1f9de1`. Review scope: M1–M3, original Catacomb II level 1, ordinary wizard controls, PNG/status/ticks and bounded recent history, original rules, comparable budgets, screenshot-derived baseline, and honest evaluation evidence. No new NPC behavior was reviewed or introduced.

The review read `AGENTS.md`, `skills/catacomb-validation/SKILL.md`, the interface/rule/player/evaluation documentation, the new player and evaluation modules, their tests, the acceptance route implementation, the existing Python/native protocol boundary, and the committed baseline and failed-provider evidence. It performed no live model/network calls, credential inspection, browser interaction, implementation edits, commits, or pushes. All review-created output is under `.tools/`.

## Confirmed findings

### R1 — P2: Budget exceptions skip final observation evidence and can discard a billed response's entire decision record

Locations: `scripts/run_episode.py:71`, `scripts/run_episode.py:84–91`, and `scripts/run_episode.py:126–130`. The triggering exception is raised by `scripts/player_contract.py:94–104` or `scripts/player_contract.py:110–122`.

`budget.reserve()` and `budget.settle()` raise `BudgetExceeded` into the outer handler. That jump bypasses the normal final-frame/hash/counter assignments at lines 126–128. On a provider-reported reservation overrun, it also bypasses every `append_event()` call for that response, along with the latency and model-version accumulation after `settle()`. The final aggregate cost is retained, but the evidence needed to audit that charged response is lost.

Concrete offline reproductions, using the real runner and a running fake environment:

- One valid eight-tick action with `max_calls=1`: termination `call_limit`, `actions=1`, `ticks=9`, but `frames=0` despite an actual counter of 2, and no `final_frame_sha256`.
- A first valid response reporting 32,769 input tokens against the 32,768 reservation: termination `provider_usage_exceeded_reservation`, `model_calls=1`, `accounted_tokens=32799`, `estimated_usd=0.0099057`, and no game action. However, `frames=0` despite an initial frame, there is no final hash, and `decisions.jsonl` does not exist at all. The raw response, provider version, finish reason, individual token counts, and latency are therefore absent from the episode evidence.

This affects ordinary call/token/spending exits as well as the deliberately supported overrun path. With default settings, invalid responses can consume calls without actions, so the call limit can precede the action limit. A safety stop must still leave an accurate, reviewable record.

Suggested correction: finalize observation-derived fields whenever an observation exists, independently of the termination path. Persist the completed response event, including known usage and the budget termination, even when settling it raises. Keep the current behavior of taking no action after a reservation overrun.

Suggested regression: run the actual episode runner with one allowed call followed by another attempted decision; assert correct frame count/final hash and no second generation. Separately return usage above the reservation and assert exactly one preserved response event, correct charged totals, preserved version/latency, and zero native actions. Cover token and spending reservation denials through the runner, rather than only testing `CallBudget` directly.

### R2 — P2: A cleanup exception can erase the episode result and omit already-accounted use from the suite

Locations: `scripts/run_episode.py:137–145`, with propagation through `scripts/evaluate.py:137–144`.

The runner closes the environment and model before updating/writing `result.json`, without isolating cleanup errors. If either `close()` raises, result finalization never happens. An environment-close failure also prevents the model from being closed. `run_suite()` does not catch the escaping exception before appending the episode or adding its spending.

Concrete offline reproduction: a valid model reply was accepted and one action was executed. Injecting `OSError` from the model's `close()` caused `run_episode()` to raise. `decisions.jsonl` existed, but `result.json` did not. This was a forced cleanup failure, not an observed outage of the real provider. It establishes the behavior of the actual failure path; native process I/O and SDK transports are fallible cleanup operations.

The episode can therefore incur measured or reserved use and still disappear from the suite's result/summary accounting. Some evidence can remain in the decision/native trace, but the promised machine-readable outcome is absent and further planned records are not finalized. This is separate from a model-playing failure.

Suggested correction: guard each cleanup independently and persist the primary outcome, accumulated use, and a separately labeled cleanup error even when closing fails. Ensure the suite either retains that returned record or records the failed episode and remaining unattempted cases before stopping. Avoid replacing a known game outcome with an invented one merely because cleanup failed.

Suggested regression: inject failures independently from environment and model `close()` after a charged response. Assert that the other cleanup still runs, `result.json` is written with correct calls/tokens/cost, and the suite retains the affected episode and a complete planned-case disposition. Include the path where an original provider error is followed by a cleanup error.

### R3 — P2: Model initialization failures are mislabeled as harness failures and do not stop the remaining unavailable model cases

Locations: `scripts/run_episode.py:51–57` and `scripts/run_episode.py:133–135`; the intended suite classification is at `scripts/evaluate.py:141`.

The result starts with `termination="initialization_error"`, and the suite explicitly treats that category as a provider-unavailability condition. But an exception while constructing the model is always caught by the generic handler and rewritten to `harness_error`. Consequently, the initialization category does not survive this normal error path, and the suite keeps attempting every remaining model case.

Concrete offline reproduction used the real `VertexPlayer` constructor with `GOOGLE_CLOUD_PROJECT` explicitly set to an empty value. It raises its local configuration error before constructing a provider client or starting the game; no credentials or network were accessed. In a two-seed current/history suite, all four model cases were recorded as attempted `harness_error` with zero actions and zero model calls. None of the remaining model cases was marked unavailable after the first setup failure.

This gives a wrong cause and needlessly turns the full planned comparison into repeated attempted failures for one persistent setup problem. It conflicts with the documented stop-after-unavailability behavior and the code's explicit `initialization_error` branch. The existing provider-failure test exercises an exception from `generate()`, not construction.

Suggested correction: classify model-client construction/configuration failures as `initialization_error` (or another explicit provider-initialization category recognized by the suite). Keep game/environment initialization failures distinguishable as harness problems. After the first provider initialization failure, preserve remaining model cases as unattempted with the unavailability reason.

Suggested regression: an offline model factory raises before environment construction. Assert the initialization termination, zero generation/game calls and no charge, one attempted model case in the suite, and correctly labeled unattempted remaining cases. The real constructor's missing-project check can be tested with the environment variable explicitly overridden as in this reproduction.

## Commands and observed results

Platform: Windows, PowerShell, existing `.venv` Python 3.13.5 (Anaconda), Pillow 11.3.0, and google-genai 2.23.0. The pinned dependencies installed locally match the two declared package versions.

For Python commands, `PYTHONDONTWRITEBYTECODE=1`, `TMP`, and `TEMP` were set so bytecode was disabled and temporary files stayed under `.tools/independent-review-20261019`. Existing native test executables were launched from that directory so their transient BMP/resource fixtures stayed there too. A fresh native build and CTest log generation were intentionally not performed under the read-only implementation constraint.

| Command (repository-relative unless noted) | Observed result |
| --- | --- |
| `git rev-parse fbe709e` and `git rev-parse HEAD` at review start | Both resolved to `fbe709e2c96227a1b472d32ddb6c9050c3e87314`; working tree was initially clean. |
| `.venv/Scripts/python.exe -B -m unittest discover -s tests -p 'test_players*.py' -v` | 12 tests passed in 0.486 s. |
| `.venv/Scripts/python.exe -B -m unittest discover -s tests -p test_interface.py -v` | 3 tests passed in 0.018 s. |
| `build-checkpoint/test_agent_protocol.exe` (launched with the review temporary directory as cwd) | Passed allowed-controls, strict-bounds, atomic-rejection checks. |
| `build-checkpoint/test_game_rules.exe` (same cwd constraint) | Passed pickups, doors, collision, healing, spells, charge/release, strafe, breakable walls, death, exit, and pixel-boundary fixtures. |
| `.venv/Scripts/python.exe -B tests/test_live_game.py --exe build-checkpoint/catacomb.exe --data data/original` | 6 tests passed in 45.181 s, including the 303-action ordinary-interface acceptance exit, deterministic frame repetition, invalid-command/observe invariance, tick cap and terminal rejection. No visible game window or audio. |
| `.venv/Scripts/python.exe -B .tools/independent-review-20261019/reproduce.py` | Exit 0; reproduced all three findings using offline model/environment fixtures and the real missing-project constructor check. |

The reviewed native executable's SHA-256 was `53dd79a40b4f469ddb7f1635e0cac17d139e22757197e870cd1ec9666c2c05cf`, matching the committed baseline native configuration. Test executable SHA-256 values: rule tests `9355ae2dba811756510ec19295effc29525cdf1b48811d43a3255d2007ab980c`; protocol tests `33b0c040aaadff7fbbf81dc456f0840f78b9eca7e6bcc648a003c270b843321d`.

Raw command logs and the reproduction source/results are in `.tools/independent-review-20261019/`. The reproduction script intentionally uses new output directories; rerunning it requires choosing new directory names rather than overwriting preserved evidence.

## Boundary assessment, test gaps and limitations

- No confirmed hidden-state leak was found in the reviewed evaluated-policy path. `PlayerContext.frame()` constructs an explicit metadata allowlist; PNGs come from the ordinary framebuffer adapter; the model receives no callable tools; the runner explicitly passes `debug=False`. Current/history use the same model settings and public rules, with only the bounded recent records differing. This is an API/context boundary, not an OS sandbox.
- The baseline implementation derives its grid, health/charge and threats from screenshots and maintains its own estimated navigation state. The privileged acceptance route is visibly separated from the evaluated policies. No evaluated policy import/read of that route or debug state was found. Baseline perception and motion ambiguity remain documented performance limitations, not a confirmed information-boundary defect.
- M1–M3 did not change native gameplay rules or add NPC behavior. The added native tests exercise the actual rule functions, and the supplied original-resource acceptance replay passed. That is not a controlled comparison against an original DOS executable.
- Existing tests cover direct budget bookkeeping, happy-path finalization, invalid JSON/actions, generated provider errors, context eviction, ordering and denominator accounting. They miss the runner-level budget exits, model construction failures, and cleanup failures identified above. In addition, the charge fixture jumps from the first charging step to manually assigned full charge; it does not alone establish the whole charging cadence. This latter point is a test-coverage limitation, not a newly demonstrated engine defect.
- The committed baseline evidence honestly reports five alive action-limit episodes and zero clears. The recorded provider pilot failed before any game action, and the ten model comparison cases remain explicitly unattempted. Therefore this review does not support a conclusion about Gemini playing ability, a memory benefit, or model-versus-baseline performance. No live-model evaluation was attempted during review.
- Human peer participation, instructor scope agreement, and original-executable fidelity remain external evidence requirements. Offline/native test success cannot fulfill them.

Review result: three confirmed P2 failure-accounting/evidence defects (R1–R3). No P0/P1 issue or new gameplay-rule regression was confirmed within this bounded review. Implementation corrections and focused regressions are required for these findings; the passing tests alone are not approval.

---

## Separate correction check — October 19, 2026

The original pinned-revision report above is preserved unchanged. After it was saved, the implementer authorized a review of the corrective working-tree delta. This section evaluates that later delta; it does not retroactively change the findings against `fbe709e`.

The correction check inspected changes to `scripts/run_episode.py`, `scripts/evaluate.py`, `tests/test_players.py`, and `tests/test_players_evaluation.py`. It did not modify those files, rerun native/live-resource tests, call a live model, or inspect unrelated documentation changes. Native game code remained outside the correction delta.

| Finding | Correction disposition |
| --- | --- |
| R1 | Addressed in the inspected delta. Final observation hash/ticks/frame count are finalized independently of budget exceptions; reserve denials and usage-overrun responses are persisted as decision events. Version/latency are retained before settlement, and an overrun still prevents a game action. Focused call-limit and overrun regressions passed. |
| R2 | Addressed for the confirmed cleanup-exception trigger. Each resource closes inside its own exception guard, both cleanups are attempted, `cleanup_errors` is retained separately, and outcome/use/result serialization proceeds. The regression injecting failures from both close methods passed and confirmed the saved result and charged use remain available. |
| R3 | Addressed in the final inspected delta. Model construction failure is categorized as `initialization_error`; remaining model cases become unavailable. Environment startup failure remains `harness_error` with `failure_stage="environment_initialization"`; a distinct `harness_unavailable_after_failure` suite outcome preserves the rest of the plan without blaming the provider or repeating infrastructure failures. Focused episode and suite classification regressions passed. |

During the first correction pass, a missing-environment fixture was incorrectly categorized as provider initialization failure. The reviewer reported and reproduced that intermediate issue in `correction-env-init.txt`. The final delta restricts provider initialization classification to non-baseline player construction and adds the separate harness-unavailability path; the targeted final tests verify this adjustment. The intermediate log is retained as history, not as an outstanding finding against the final inspected delta.

Independent correction test evidence:

- First correction: `.venv/Scripts/python.exe -B -m unittest discover -s tests -p 'test_players*.py' -v` — 18 passed in 0.518 s (`correction-tests.txt`).
- Final classification adjustment, with `PYTHONPATH` set to `tests`: `.venv/Scripts/python.exe -B -m unittest -v test_players.PlayerTests.test_missing_engine_is_not_a_provider_failure test_players_evaluation.EvaluationTests.test_harness_failure_preserves_plan_with_correct_reason test_players_evaluation.EvaluationTests.test_real_initialization_error_stops_remaining_model_cases` — 3 passed in 0.097 s (`correction-classification-tests.txt`).
- The implementer separately reported that the final complete 20-case player/evaluation suite passed. The independent reviewer did not rerun the whole suite after the narrow final classification adjustment; the three affected checks above were run directly.

SHA-256 fingerprints of the final inspected corrective files (working-tree changes, not a new pinned commit):

| File | SHA-256 |
| --- | --- |
| `scripts/run_episode.py` | `03d9566585ac810fd6c4a256000ff8bc8ffc67830955e03ac48f83a98895ed2d` |
| `scripts/evaluate.py` | `a41bc80ee931987a7ccfdecad4495b5947275ac28228bee6504501a3398352f8` |
| `tests/test_players.py` | `3bb8025e7d97e85ccf99a66a8673465416b5c7a7e3051633d090202dc7cbf476` |
| `tests/test_players_evaluation.py` | `2eff0b429cf83a72677324095d596733e5d86f13e695d7edfcd5d93634e189ce` |

Correction result: the three confirmed findings are addressed by this inspected delta, with no additional confirmed issue remaining from the focused correction check. This remains an independent AI implementation review, not human playtesting, instructor approval, proof of live-model performance, or an assertion that no other defects exist. The external-evidence limitations recorded above remain open.
