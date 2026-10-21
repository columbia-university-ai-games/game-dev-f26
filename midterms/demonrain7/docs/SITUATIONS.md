# Declared level-one situations

Declared October 21, 2026, before changes to the player or its prompt. The
machine-readable record is `config/situations-v2.json`. This is a deliberate
evaluation design, not a claim that these are three original game levels.

| Case | Start | Legal preparation actions | Native start tick | Use |
| --- | --- | ---: | ---: | --- |
| `s1-entrance` | Original entrance, fresh inventory | 0 | 1 | Development |
| `s2-clearing` | Clearing with visible enemies and collected resources | 64 | 129 | Held out from policy/prompt tuning |
| `s3-door` | Locked-door approach with accumulated inventory | 264 | 529 | Held out from policy/prompt tuning |

Every case has the same task: leave level one alive through any original exit.
Task score is 1 for `cleared`, otherwise 0; it is not the original HUD points.
Each policy receives at most 80 actions and 2,000 simulation ticks **after**
preparation. Other limits remain explicit in the chosen player configuration.
Preparation does not consume the player's action/tick budget or appear in its
history. The first player-visible tick is 0 in the situation adapter; the native
protocol's startup tick remains 1. Evaluator logs retain both clocks.

The preparations are prefixes of the existing acceptance fixture, pinned by
SHA-256 of canonical JSON (sorted keys, compact separators, UTF-8), so a Git
LF/CRLF conversion cannot change the pin. The October 21 portability correction
changed only hash representation, not the declared actions or starts.
That fixture was found using read-only developer state. It is permitted
only in the trusted reset harness, never in a baseline/model context. No
teleport, inventory refill, enemy freeze, damage change or other world edit is
used. Starting image hashes cover decompressed PNG scanlines, avoiding dependence
on a particular zlib compression version. The four asset hashes are pinned too.

The two held-out starts were selected by inspecting the existing acceptance
frames, not by comparing player outcomes. Reset/contract tests may inspect them;
policy or prompt tuning must use `s1-entrance` only. These cases share a known map
and are not independent maps or evidence of unseen-map generalization. A seed
varies a policy/provider request; it does not randomize the original level.

Two repetitions per case and policy are planned: baseline, current image, and
bounded history. This gives 18 episodes, including 12 live model episodes. A
successful reset or acceptance replay is not a successful model episode.

Implementation and validation are recorded separately in the checkpoint evidence.
