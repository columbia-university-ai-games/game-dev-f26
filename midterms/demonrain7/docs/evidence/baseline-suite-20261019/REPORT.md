AI-use disclosure: Codex implemented this report generator; figures below are calculated from recorded episode outcomes.

# Catacomb II evaluation

Configuration: `0f00157c24f35728f7750c98dd6ed80d30c12da96160d77e476a6dbcfdd1eb26`.
Source revision: `7768a494917d01a9245922679a0732f62bac2b96`. Native and resource hashes are stored in each attempted episode.
Earlier reserved use: $0.011110; suite ceiling including that use: $3.00.

| Policy | Planned | Attempted | With actions | Cleared | Median actions | Estimated USD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 5 | 5 | 5 | 0 | 80 | 0.000000 |
| current | 5 | 0 | 0 | 0 | unavailable | 0.000000 |
| history | 5 | 0 | 0 | 0 | unavailable | 0.000000 |

## Interpretation and limits

The same original first-level start, actions, stepping rules and episode limits apply to every policy. Model policies differ only in whether the last three permitted observation/action/intent records are included. Repeated model calls are independent requests; provider seeds do not guarantee determinism. Baseline seeds vary tie breaking. There is no training or cross-episode memory.

Failure and unavailable records are retained. A condition with no actions does not establish playing performance. Clear-rate denominators include attempted failures; unattempted conditions are excluded. The JSON report includes descriptive Wilson intervals, but this small fixed-map study does not establish generalization or statistically independent map samples.

Unique screenshot hashes measure changing images, not explored area. Usage is estimated at recorded uncached rates; unknown usage retains its full reservation. Cloud billing/credit balances are separate. The privileged winning acceptance route is not an evaluated baseline.

## Terminations

- baseline: `{"action_limit": 5}`
- current: `{"reauthentication_required": 5}`
- history: `{"reauthentication_required": 5}`

**Live model/history comparison is incomplete. No conclusion about Gemini playing quality or the effect of memory is supported yet.**
