AI-use disclosure: Codex documented the existing adapter/evaluator choices on October 21, 2026. This specification does not add or claim unimplemented gameplay.

# Deliberate adaptations and interface specification

The inherited game rules are mapped separately in [RULE_SOURCE_MAP.md](RULE_SOURCE_MAP.md). The choices here carry the `design` label under the revised assignment. Source implementation confirms that a choice exists; it does not turn that choice into an original Catacomb rule.

## D1: bounded level and outcome

Use original level 1 and fresh-game inventory. Original death or any original level exit terminates the episode. A secret/warp exit also counts as leaving this level. Levels 2–30 are excluded to keep a complete, testable scope. An evaluator limit is a separate truncation, never a game win. Existing implementation: `agent_bridge.c`, `episode_status` and `AgentRun`; original exits remain in `cat_play.c`.

## D2: time and controls

Agent mode performs one neutral startup tick to draw the player, then waits between commands. A valid action advances 1–32 original simulation ticks unless termination occurs sooner. The model's thinking time does not advance the game. This makes bounded API play feasible without requiring an API request per display frame. Native human play remains real time; no human-equivalent reaction claim is made.

The player may move in eight directions or stay neutral, charge/release fire, strafe, and attempt at most one consumable per action. Native rules decide whether that attempt is effective. No reset, save/load, warp, cheat or menu controls are in the player vocabulary. Invalid requests advance nothing. See [INTERFACE.md](INTERFACE.md) for the actual fields and post-terminal behavior.

## D3: observation boundary

The player receives the original rendered PNG/HUD and allowlisted status/tick metadata, without audio in this adapter version. Hidden map, coordinates, enemy lists, future events, source, debug tools, resource paths and precomputed routes are evaluator-only. Status/ticks are declared adapter metadata rather than a claim about the original DOS UI. Source: `agent_bridge.c`, `observation`; `scripts/player_contract.py`, `PlayerContext`.

Current-image and history modes use the same model/settings/public instructions. History supplies at most three prior permitted observation/action/short-intent records and is cleared for each episode. No persistent memory or training is implemented. This compares a specific bounded context choice rather than claiming general learning.

## D4: authority, invalid actions and limits

The trusted local runner owns the game process, validates actions and enforces step/tick/call/time/token/estimated-cost limits. The remote player has no repository, filesystem, shell or evaluator tools. Invalid model output consumes a call but does not change game state. Provider failures/timeouts stop without an unreported fallback. Failed and unknown-use requests remain accounted for. The API separation is not an OS sandbox for arbitrary code running on the host.

Existing numeric limits in `config/midterm.json` belong to the preliminary study. Future situation-specific budgets must be versioned before tuning/evaluation rather than silently changing that historical record.

## D5: declared situation evaluation

The three starts in [SITUATIONS.md](SITUATIONS.md) were declared in commit
`b68a641` before policy tuning. `scripts/situation_env.py`, `SituationEnv`,
implements the five operations using ordinary input prefixes from a fresh
process. No world values are edited. It verifies resource hashes and the
declared starting image/tick, failing closed on a mismatch. Preparation remains
outside the playing context and history. Every new runner episode constructs a
fresh policy and `PlayerContext`.

The situation adapter reports player ticks from zero and permits 2,000 further
native ticks and 80 actions. It records the original native starting clock and
preparation actions separately. Player deliberation time starts after preparation;
total elapsed time is also recorded. The native v1 API and human game are unchanged.
All cases ask for the original level-one exit: task score is 1 only for `cleared`,
otherwise 0, distinct from the original HUD score. Native death/exit takes
precedence over an evaluator cap on the same action. `legal_actions(0)` returns
a static control schema while ongoing, and no actions after termination.

`config/midterm-v2.json` declares two seeds per case and three policies (18 trials).
It is a preflight configuration, not a completed experiment: $0.20 per model
episode, $3 cumulative suite ceiling and $0.0111104 prior reserved use. Carry
forward any further pilot spending explicitly. Provider access/prices and final
player settings still need the P2/P4 checks before live evaluation.
