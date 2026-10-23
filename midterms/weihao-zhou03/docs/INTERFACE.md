# Shared contract v1 — declared before implementation

`src/core/types.ts` is the shared public schema. Engine export: `createGame(seed=101, scenario='A'): GameInterface`. Optional exported `SCENARIOS` list and `SPECIES` metadata are public design knowledge. Core `game.ts` exports these. Direction north means y decreases. Sea is 100×70; fixed continuous coordinates, eight action directions, one action per tick. There is no per-frame rule update.

Action IDs: `wait`, `move:N:quiet`, `move:N:rush` (all eight directions), `ping:weak`, `ping:strong`, `beacon:chime:0`, `beacon:chime:2`, `beacon:drone:0`, `beacon:drone:2`, `cast:N` (eight directions), `reel:steady`, `reel:strong`, `reel:slack`, `evade:N` (eight), `return`.

EXPLORING permits wait/move/ping/beacon if inventory/cast/return if in harbor. FISHING permits wait/reel/evade. Cast/evade legality never depends on hidden fish or predator occupancy. Movement validity depends on public reefs/bounds and swept path. Invalid actions leave world tick/state unchanged (runner counts mistakes and enforces a bound). Ended games reject steps. `observe` and `legal_actions` are pure reads and never consume RNG.

Renderer consumes only PublicObservation. It can cache prior public projections to interpolate; it never receives WorldState. All decision-relevant audio comes from public events. Public fishing numeric progress/tension is identical for humans and models. Current fishing cue resolves the next submitted reel; only then does the next cue get generated. Existing threat resolves after player action; a newly announced one waits at least one action. Evade cuts the hooked fish and moves atomically. Returning to port first resolves any already announced attack; if hull survives, cargo is banked and return takes priority over night expiry on the final tick. No new attack is prepared after docking.

Contacts are snapshots with independent observation-local IDs, not tracking identities. Old contacts expire after 9 game ticks; their centers do not move and their uncertainty grows. Optional danger wake gives bearing/urgency; announced attacks give an identical explicit water corridor to human and model. End-of-run private traces are never accepted as player observation.

Node runner imports only `createGame` and types. Policies receive observation and bounded public action/observation history, never the interface object or private state. Base URL/model/key use ECHO_API_BASE/ECHO_MODEL/ECHO_API_KEY. API is server/CLI only; browser has no credentials.
