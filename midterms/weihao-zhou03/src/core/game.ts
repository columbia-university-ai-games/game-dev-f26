import type {GameInterface,ScenarioId} from './types.ts';
import {createWorld,project,legalActions,applyAction} from './simulation.ts';
export {SCENARIOS,SPECIES} from './simulation.ts';
export function createGame(seed=101,scenario:ScenarioId='A'):GameInterface {
 let world=createWorld(seed,scenario);
 return {
  reset(nextSeed:number,nextScenario:ScenarioId='A'){world=createWorld(nextSeed,nextScenario);return project(world);},
  observe(){return project(world);},
  legal_actions(){return [...legalActions(world)];},
  step(_playerId,action){if(!action||typeof action.id!=='string'||!legalActions(world).includes(action.id))return {accepted:false,error:'Action is not permitted by the public action contract.',observation:project(world)};applyAction(world,action.id);return {accepted:true,observation:project(world)};},
  outcome(){return structuredClone(world.result);}
 };
}
