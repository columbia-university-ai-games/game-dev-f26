export type Vec2 = { x: number; y: number };
export const DIRECTIONS = ['N','NE','E','SE','S','SW','W','NW'] as const;
export type Direction = typeof DIRECTIONS[number];
export type Species = 'silver-bell' | 'reefback' | 'glassfin';
export type ScenarioId = 'A' | 'B' | 'C';
export type FishCue = 'tired' | 'pulling' | 'burst';
export interface Action { id: string }
export interface ScenarioInfo { id: ScenarioId; name: string; subtitle: string; budget: number; quota: number; }
export interface PublicMap { width: number; height: number; harbor: Vec2; harborRadius: number; reefs: Vec2[][]; }
export interface Contact { id: string; tick: number; position: Vec2; uncertainty: number; hint: 'fish-school' | 'large-anomaly'; species?: Species; }
export interface PublicBeacon { id: string; position: Vec2; profile: 'chime'|'drone'; startsIn: number; life: number; active: boolean; }
export interface PublicEvent { kind: string; text: string; position?: Vec2; intensity?: number; }
export interface Threat { start: Vec2; end: Vec2; width: number; resolvesIn: number; }
export interface Cargo { species: Species; value: number }
export interface Outcome { terminal: boolean; reason: 'returned'|'sunk'|'night_expired'|'runner_limit'|null; returned: boolean; success: boolean; score: number; delivered: Cargo[]; }
export interface PublicObservation {
  schemaVersion: 1; tick: number; phase: 'EXPLORING'|'FISHING'|'TERMINAL'; scenario: ScenarioInfo;
  map: PublicMap; boat: { position: Vec2; heading: Direction; hull: number; maxHull: number; beaconsLeft: number; cargo: Cargo[] };
  remaining: number; contacts: Contact[]; beacons: PublicBeacon[];
  fishing: null | { species: Species; progress: number; tension: number; cue: FishCue; lineEnd: Vec2 };
  threat: Threat|null; warning: null|{ bearing: Direction; urgency: 'distant'|'near' };
  events: PublicEvent[]; legalActions: string[]; outcome: Outcome;
}
export interface StepResult { accepted: boolean; error?: string; observation: PublicObservation; }
export interface GameInterface {
  reset(seed: number, scenario?: ScenarioId): PublicObservation;
  observe(playerId?: string): PublicObservation;
  legal_actions(playerId?: string): string[];
  step(playerId: string, action: Action): StepResult;
  outcome(): Outcome;
}
