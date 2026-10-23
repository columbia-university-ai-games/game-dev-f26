import type { Action, PublicObservation } from '../core/types.ts';
import type { PublicTurn } from './baseline.ts';

export const PROMPT_VERSION='echo-public-player-2';
export const SYSTEM_PROMPT=`You play Echo Fishery, a finite acoustic fishing game. Return exactly one JSON object {"id":"one legal action id"}; no other keys or prose. The game alone owns state. Maximize completing the fish quota AND returning to harbor. Cargo is unbanked until return. Empty return is not success. Use only this public observation and optional recent public history; echoes are aging snapshots, never live coordinates. Never infer hidden identities from contact ids.
World rules: coordinates 100x70, north decreases y. Each valid action costs one tick. Quiet movement 4, rush 7 (louder), cut/evade 8. Public reefs block swept movement; legalActions lists available choices. Cast range 10, direction cone +/-45 degrees. Weak sonar range24, strong45; stronger sound reveals more and attracts danger. Sonar contacts persist9 ticks but grow uncertain. A chime/drone beacon is deployed at your boat, lasts7 active ticks, starts immediately or after2 ticks, and draws fish/danger differently. Lay a sound source then move to a casting position to create an acoustic window. New boat/fish noise competes with old sound; danger is not permanently distracted.
Fishing: current cue applies to THIS action. Steady adds20 progress, tension +2 tired/+15 burst/+8 pulling. Strong adds38 progress, tension +14 tired/+40 burst/+25 pulling; louder and faster. Slack loses5 progress and lowers tension28. Tension100 snaps the line. Progress100 catches cargo. Evade cuts the fish and moves atomically. A public threat corridor is fixed and resolves after your next action; newly announced threats never instantly hit. Threat.width is the corridor HALF-width: an endpoint within that distance from its segment can be hit. Warning bearing is approximate, not a predator coordinate. Check escape endpoints against the corridor. Return first resolves an already announced attack, then banks cargo only if the boat survives; harbor does not grant immunity. Leave enough time to navigate around reefs and explicitly return at harbor (radius5), even on final tick. Animation and API delay do not consume ticks.`;

export interface CallRecord {
  index:number; latencyMs:number; status:'ok'|'timeout'|'http_error'|'network_error'|'invalid_response'|'invalid_action';
  httpStatus?:number; reason?:string; inputTokens:number|null; outputTokens:number|null;
}
export interface ModelConfig {
  baseUrl:string;model:string;apiKey:string;historySteps:number;timeoutMs:number;maxOutputTokens:number;
  maxCalls:number; history:boolean; fetchImpl?:typeof fetch;
}
export interface ModelDecision { action:Action|null; calls:CallRecord[]; fallbackReason?:string; budgetExhausted:boolean; }

export function validateProposal(text:string,legal:string[]):{action?:Action;reason?:string}{
  let value:unknown;
  try{value=JSON.parse(text);}catch{return {reason:'not_json'};}
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==1||typeof (value as Action).id!=='string')
    return {reason:'expected_single_id_object'};
  if(!legal.includes((value as Action).id)) return {reason:'action_not_legal'};
  return {action:{id:(value as Action).id}};
}

export function buildMessages(o:PublicObservation,history:PublicTurn[],config:Pick<ModelConfig,'history'|'historySteps'>,repair?:string){
  const context={observation:o,...(config.history?{recentPublicHistory:history.slice(-config.historySteps)}:{})};
  return [
    {role:'system',content:SYSTEM_PROMPT},
    {role:'user',content:JSON.stringify(context)},
    ...(repair?[{role:'user',content:`The previous proposal failed validation (${repair}). Return exactly {"id":"one entry from observation.legalActions"}. This repair consumes another model call.`}]:[])
  ];
}

function token(value:unknown):number|null{return typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;}

/** Each call is independently bounded. Failures consume the same call budget as successful proposals. */
export async function chooseModelAction(o:PublicObservation,history:PublicTurn[],config:ModelConfig,callsUsed:number):Promise<ModelDecision>{
  const calls:CallRecord[]=[];let repair:string|undefined;
  for(let attempt=0;attempt<2;attempt++){
    if(callsUsed+calls.length>=config.maxCalls)
      return {action:null,calls,budgetExhausted:true,fallbackReason:repair??'call_budget_exhausted'};
    const controller=new AbortController();const start=performance.now();let timedOut=false;
    const timeout=setTimeout(()=>{timedOut=true;controller.abort();},config.timeoutMs);
    const record:CallRecord={index:callsUsed+calls.length+1,latencyMs:0,status:'network_error',inputTokens:null,outputTokens:null};
    try{
      const response=await (config.fetchImpl??fetch)(`${config.baseUrl.replace(/\/$/,'')}/chat/completions`,{
        method:'POST',signal:controller.signal,
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${config.apiKey}`},
        body:JSON.stringify({model:config.model,messages:buildMessages(o,history,config,repair),max_tokens:config.maxOutputTokens,response_format:{type:'json_object'}})
      });
      record.httpStatus=response.status;
      if(!response.ok){record.status='http_error';record.reason=`http_${response.status}`;}
      else{
        const data=await response.json() as {choices?:{message?:{content?:unknown}}[];usage?:{prompt_tokens?:unknown;completion_tokens?:unknown}};
        record.inputTokens=token(data.usage?.prompt_tokens);record.outputTokens=token(data.usage?.completion_tokens);
        const content=data.choices?.[0]?.message?.content;
        if(typeof content!=='string'){record.status='invalid_response';record.reason='missing_message_content';}
        else{
          const proposal=validateProposal(content,o.legalActions);
          record.status=proposal.action?'ok':proposal.reason==='action_not_legal'?'invalid_action':'invalid_response';record.reason=proposal.reason;
          if(proposal.action){record.latencyMs=performance.now()-start;calls.push(record);return {action:proposal.action,calls,budgetExhausted:false};}
        }
      }
    }catch{record.status=timedOut?'timeout':'network_error';record.reason=timedOut?'request_timeout':'request_failed';}
    finally{clearTimeout(timeout);}
    record.latencyMs=performance.now()-start;calls.push(record);repair=record.reason??record.status;
  }
  return {action:null,calls,budgetExhausted:callsUsed+calls.length>=config.maxCalls,fallbackReason:repair??'model_proposal_failed'};
}
