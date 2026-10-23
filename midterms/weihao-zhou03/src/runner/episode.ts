import { createGame } from '../core/game.ts';
import type { Action, Outcome, PublicObservation, ScenarioId } from '../core/types.ts';
import { BASELINE_VERSION, chooseBaselineAction, type PublicTurn } from '../players/baseline.ts';
import { chooseModelAction, PROMPT_VERSION, type CallRecord, type ModelConfig } from '../players/model.ts';

export type PlayerKind='baseline'|'mock'|'model-current'|'model-history';
export interface EpisodeConfig {
  player:PlayerKind;seed:number;scenario:ScenarioId;repetition?:number;caseId?:string;maxSteps:number;maxInvalidActions:number;
  model?:ModelConfig;gameVersion?:string;
}
export interface TraceStep {
  observation:PublicObservation;action:Action;accepted:boolean;error?:string;source:'baseline'|'mock'|'model'|'fallback';
  calls:CallRecord[];fallbackReason?:string;
}
export interface EpisodeTrace {
  schemaVersion:1;kind:'public-episode';startedAt:string;config:Omit<EpisodeConfig,'model'>&{model?:Omit<ModelConfig,'apiKey'|'fetchImpl'>};
  versions:{baseline:string;prompt:string};steps:TraceStep[];finalObservation:PublicObservation;result:EpisodeResult;
}
export interface EpisodeResult {
  player:PlayerKind;scenario:ScenarioId;seed:number;caseId?:string;repetition:number;live:boolean;
  outcome:Outcome;steps:number;invalidActions:number;calls:number;failedCalls:number;fallbacks:number;latencyMs:number;
  inputTokens:number|null;outputTokens:number|null;estimatedCost:null;deliveredValue:number;hull:number;
  runnerStop:null|'call_budget'|'step_limit'|'invalid_action_limit';model:string|null;promptVersion:string;gameVersion:string;
}
const sumKnown=(calls:CallRecord[],field:'inputTokens'|'outputTokens')=>calls.length&&calls.every(c=>c[field]!==null)?calls.reduce((s,c)=>s+(c[field]??0),0):null;
type ResultConfig=Omit<EpisodeConfig,'model'>&{model?:Pick<ModelConfig,'model'>};
type LimitConfig=Pick<EpisodeConfig,'player'|'maxSteps'|'maxInvalidActions'>&{model?:Pick<ModelConfig,'maxCalls'>};
function stopAtBoundary(config:LimitConfig,o:PublicObservation,attempts:number,invalid:number,calls:number):EpisodeResult['runnerStop']{
  if(o.outcome.terminal) return null;
  if(attempts>=config.maxSteps) return 'step_limit';
  if(invalid>=config.maxInvalidActions) return 'invalid_action_limit';
  if(config.player.startsWith('model-')&&config.model&&calls>=config.model.maxCalls) return 'call_budget';
  return null;
}
function summarize(config:ResultConfig,o:PublicObservation,steps:TraceStep[],stop:EpisodeResult['runnerStop'],promptVersion:string):EpisodeResult{
  const calls=steps.flatMap(s=>s.calls);
  const outcome:Outcome=stop?{terminal:true,reason:'runner_limit',returned:false,success:false,score:0,delivered:[]}:structuredClone(o.outcome);
  return {player:config.player,scenario:config.scenario,seed:config.seed,caseId:config.caseId,repetition:config.repetition??1,
    live:config.player.startsWith('model-'),outcome,steps:steps.length,invalidActions:steps.filter(s=>!s.accepted).length,calls:calls.length,
    failedCalls:calls.filter(c=>c.status!=='ok').length,fallbacks:steps.filter(s=>s.source==='fallback').length,
    latencyMs:calls.reduce((n,c)=>n+c.latencyMs,0),inputTokens:sumKnown(calls,'inputTokens'),outputTokens:sumKnown(calls,'outputTokens'),
    estimatedCost:null,deliveredValue:outcome.delivered.reduce((n,c)=>n+c.value,0),hull:o.boat.hull,runnerStop:stop,
    model:config.model?.model??null,promptVersion,gameVersion:config.gameVersion??'unversioned-working-tree'};
}

export async function runEpisode(config:EpisodeConfig):Promise<EpisodeTrace>{
  const game=createGame(config.seed,config.scenario);let o=game.observe();
  const steps:TraceStep[]=[];const history:PublicTurn[]=[];let invalid=0;let stop:EpisodeResult['runnerStop']=null;
  const allCalls:CallRecord[]=[];
  for(let index=0;!o.outcome.terminal;index++){
    stop=stopAtBoundary(config,o,index,invalid,allCalls.length);if(stop) break;
    let action:Action;let source:TraceStep['source'];let calls:CallRecord[]=[];let fallbackReason:string|undefined;
    if(config.player.startsWith('model-')){
      if(!config.model) throw new Error('Model player needs explicit live model configuration.');
      if(allCalls.length>=config.model.maxCalls){stop='call_budget';break;}
      const decision=await chooseModelAction(o,history,{...config.model,history:config.player==='model-history'},allCalls.length);
      calls=decision.calls;allCalls.push(...calls);
      if(decision.action){action=decision.action;source='model';}
      else{
        // A failed real model is visibly labeled, never relabeled as a successful model/fixture turn.
        action=chooseBaselineAction(o,history);source='fallback';fallbackReason=decision.fallbackReason;
      }
    }else{action=chooseBaselineAction(o,history);source=config.player==='mock'?'mock':'baseline';}
    const before=o;const result=game.step('player',action);o=result.observation;
    if(!result.accepted) invalid++;
    steps.push({observation:before,action,accepted:result.accepted,error:result.error,source,calls,fallbackReason});
    if(result.accepted) history.push({observation:before,action});
    if(history.length>12) history.shift();
  }
  const result=summarize(config,o,steps,stop,PROMPT_VERSION);
  const {model,...safe}=config;let safeModel:EpisodeTrace['config']['model'];
  if(model){const {apiKey:_,fetchImpl:__,...publicModel}=model;safeModel=publicModel;}
  return {schemaVersion:1,kind:'public-episode',startedAt:new Date().toISOString(),config:{...safe,...(safeModel?{model:safeModel}:{})},
    versions:{baseline:BASELINE_VERSION,prompt:PROMPT_VERSION},steps,finalObservation:o,result};
}

/** Replay performs no model calls and compares every public state, not just the score. */
export function replayTrace(trace:EpisodeTrace):{verified:boolean;steps:number;error?:string}{
  const game=createGame(trace.config.seed,trace.config.scenario);
  const fail=(steps:number,error:string)=>({verified:false,steps,error});
  const modelPlayer=trace.config.player.startsWith('model-');
  if(!Number.isSafeInteger(trace.config.maxSteps)||trace.config.maxSteps<1||!Number.isSafeInteger(trace.config.maxInvalidActions)||trace.config.maxInvalidActions<1)
    return fail(0,'invalid_limit_config');
  if(modelPlayer&&(!trace.config.model||!Number.isSafeInteger(trace.config.model.maxCalls)||trace.config.model.maxCalls<1)) return fail(0,'invalid_model_config');
  let invalid=0,callCount=0;
  for(let i=0;i<trace.steps.length;i++){
    const step=trace.steps[i];
    const before=game.observe();
    if(before.outcome.terminal) return fail(i,'step_after_terminal');
    if(stopAtBoundary(trace.config,before,i,invalid,callCount)) return fail(i,'step_after_runner_limit');
    if(JSON.stringify(game.observe())!==JSON.stringify(step.observation)) return {verified:false,steps:i,error:'observation_mismatch'};
    if(!Array.isArray(step.calls)) return fail(i,'invalid_call_records');
    if(!modelPlayer){
      if(step.calls.length||step.source!==(trace.config.player==='mock'?'mock':'baseline')||step.fallbackReason!==undefined) return fail(i,'player_source_mismatch');
    }else{
      if(step.calls.length<1||step.calls.length>2||callCount+step.calls.length>trace.config.model!.maxCalls) return fail(i,'call_budget_mismatch');
      if(step.source==='model'){
        if(step.calls.at(-1)?.status!=='ok'||step.fallbackReason!==undefined||step.calls.slice(0,-1).some(c=>c.status==='ok')) return fail(i,'model_source_mismatch');
      }else if(step.source==='fallback'){
        if(!step.fallbackReason||step.calls.some(c=>c.status==='ok')) return fail(i,'fallback_source_mismatch');
      }else return fail(i,'player_source_mismatch');
    }
    for(const call of step.calls){
      callCount++;
      if(call.index!==callCount||!Number.isFinite(call.latencyMs)||call.latencyMs<0||!['ok','timeout','http_error','network_error','invalid_response','invalid_action'].includes(call.status)) return fail(i,'invalid_call_record');
      if([call.inputTokens,call.outputTokens].some(n=>n!==null&&(!Number.isSafeInteger(n)||n<0))) return fail(i,'invalid_usage_record');
    }
    const result=game.step('player',step.action);
    if(result.accepted!==step.accepted) return {verified:false,steps:i,error:'acceptance_mismatch'};
    if(result.error!==step.error) return fail(i,'step_error_mismatch');
    if(!result.accepted) invalid++;
  }
  const final=game.observe();
  if(JSON.stringify(final)!==JSON.stringify(trace.finalObservation)) return {verified:false,steps:trace.steps.length,error:'final_observation_mismatch'};
  const actualStop=stopAtBoundary(trace.config,final,trace.steps.length,invalid,callCount);
  if(!final.outcome.terminal&&!actualStop) return fail(trace.steps.length,'unfinished_without_limit');
  if(trace.result.runnerStop!==actualStop) return fail(trace.steps.length,'runner_stop_mismatch');
  const expectedResult=summarize(trace.config,final,trace.steps,actualStop,trace.versions.prompt);
  const expectedOutcome=expectedResult.outcome;
  if(JSON.stringify(expectedOutcome)!==JSON.stringify(trace.result.outcome)) return {verified:false,steps:trace.steps.length,error:'outcome_mismatch'};
  for(const key of Object.keys(expectedResult) as (keyof EpisodeResult)[])
    if(JSON.stringify(expectedResult[key])!==JSON.stringify(trace.result[key])) return fail(trace.steps.length,`summary_mismatch_${key}`);
  return {verified:true,steps:trace.steps.length};
}
