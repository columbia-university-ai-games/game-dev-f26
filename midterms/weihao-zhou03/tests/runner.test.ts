import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server, type RequestListener } from 'node:http';
import { once } from 'node:events';
import { createGame } from '../src/core/game.ts';
import { chooseBaselineAction } from '../src/players/baseline.ts';
import { buildMessages, chooseModelAction, validateProposal, type ModelConfig } from '../src/players/model.ts';
import { replayTrace, runEpisode } from '../src/runner/episode.ts';

const config=(baseUrl:string,extra:Partial<ModelConfig>={}):ModelConfig=>({baseUrl,apiKey:'unit-test-only',model:'mock-test',history:false,
  historySteps:6,timeoutMs:300,maxCalls:4,maxOutputTokens:200,...extra});
async function server(handler:RequestListener):Promise<{server:Server;baseUrl:string;close:()=>Promise<void>}>{
  const instance=createServer(handler);instance.listen(0,'127.0.0.1');await once(instance,'listening');
  const address=instance.address();if(!address||typeof address==='string') throw new Error('No test port');
  return {server:instance,baseUrl:`http://127.0.0.1:${address.port}/v1`,close:()=>new Promise(resolve=>{instance.closeAllConnections();instance.close(()=>resolve());})};
}
test('strict model proposal validation rejects extra fields and unavailable actions',()=>{
  assert.equal(validateProposal('{"id":"wait","inventory":999}',['wait']).reason,'expected_single_id_object');
  assert.equal(validateProposal('{"id":"teleport"}',['wait']).reason,'action_not_legal');
  assert.equal(validateProposal('```json\n{"id":"wait"}\n```',['wait']).reason,'not_json');
  assert.deepEqual(validateProposal('{"id":"wait"}',['wait']).action,{id:'wait'});
});
test('current-only context drops all prior observations; history is bounded to six',()=>{
  const o=createGame(101,'A').observe();const history=Array.from({length:9},(_,i)=>({observation:{...o,tick:i},action:{id:'wait'}}));
  const current=buildMessages(o,history,{history:false,historySteps:6});
  assert.equal(current.length,2);assert.equal(JSON.parse(current[1].content).recentPublicHistory,undefined);
  const past=JSON.parse(buildMessages(o,history,{history:true,historySteps:6})[1].content).recentPublicHistory;
  assert.equal(past.length,6);assert.equal(past[0].observation.tick,3);
  assert.equal('world' in JSON.parse(current[1].content),false);
});
test('invalid real transport output is counted, repaired once, and usage survives',async()=>{
  const seen:unknown[]=[];let n=0;
  const fixture=await server((req,res)=>{
    let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{
      seen.push(JSON.parse(body));n++;
      res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{message:{content:n===1?'not JSON':'{"id":"wait"}'}}],usage:{prompt_tokens:10,completion_tokens:3}}));
    });
  });
  try{
    const decision=await chooseModelAction(createGame().observe(),[],config(fixture.baseUrl),0);
    assert.deepEqual(decision.action,{id:'wait'});assert.equal(decision.calls.length,2);
    assert.equal(decision.calls[0].status,'invalid_response');assert.equal(decision.calls[1].status,'ok');
    assert.equal(decision.calls[0].inputTokens,10);assert.equal(seen.length,2);
    assert.equal((seen[1] as {messages:unknown[]}).messages.length,3);
  }finally{await fixture.close();}
});
test('timeout consumes a call; no repair can exceed remaining call budget',async()=>{
  let requests=0;const fixture=await server(()=>{requests++;});
  try{
    const decision=await chooseModelAction(createGame().observe(),[],config(fixture.baseUrl,{timeoutMs:30,maxCalls:1}),0);
    assert.equal(requests,1);assert.equal(decision.calls.length,1);assert.equal(decision.calls[0].status,'timeout');
    assert.equal(decision.budgetExhausted,true);assert.equal(decision.action,null);
  }finally{await fixture.close();}
});
test('HTTP error and invalid legal id are both counted; model failure is explicit fallback',async()=>{
  let requests=0;const fixture=await server((_req,res)=>{
    requests++;if(requests===1){res.statusCode=429;res.end('rate limit');return;}
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{message:{content:'{"id":"cheat"}'}}]}));
  });
  try{
    const trace=await runEpisode({player:'model-current',seed:101,scenario:'A',maxSteps:5,maxInvalidActions:3,
      model:config(fixture.baseUrl,{maxCalls:2})});
    assert.equal(trace.result.calls,2);assert.equal(trace.result.failedCalls,2);assert.equal(trace.result.fallbacks,1);
    assert.equal(trace.steps[0].source,'fallback');assert.equal(trace.steps[0].fallbackReason,'action_not_legal');
    assert.equal(trace.result.runnerStop,'call_budget');assert.equal(trace.steps.length,1);assert.equal(requests,2);
    assert.equal(JSON.stringify(trace).includes('unit-test-only'),false);
    assert.equal(replayTrace(trace).verified,true);
  }finally{await fixture.close();}
});
test('baseline episodes obey the action interface and replay exactly without model transport',async()=>{
  const trace=await runEpisode({player:'baseline',seed:101,scenario:'A',maxSteps:100,maxInvalidActions:3});
  assert.equal(trace.result.calls,0);assert.equal(trace.result.live,false);assert.equal(trace.result.invalidActions,0);
  assert.ok(trace.steps.some(t=>t.action.id.startsWith('ping:')));
  assert.ok(trace.steps.every(t=>t.observation.legalActions.includes(t.action.id)));
  assert.deepEqual(replayTrace(trace),{verified:true,steps:trace.steps.length});
  assert.ok(trace.result.outcome.terminal);
  const altered=structuredClone(trace);altered.result.outcome.score+=1;
  assert.equal(replayTrace(altered).error,'outcome_mismatch');
});
test('baseline cuts to a safe corridor endpoint when carrying an unsafe unfinished fish',()=>{
  const o=createGame().observe();o.phase='FISHING';o.boat.position={x:40,y:40};
  o.fishing={species:'silver-bell',progress:20,tension:70,cue:'burst',lineEnd:{x:45,y:40}};
  o.threat={start:{x:30,y:40},end:{x:50,y:40},width:5,resolvesIn:1};
  o.legalActions=['reel:steady','reel:strong','reel:slack','evade:N','evade:E'];
  assert.equal(chooseBaselineAction(o).id,'evade:N');
});
test('baseline escapes an announced harbor corridor before banking quota cargo',()=>{
  const o=createGame(101,'A').observe();o.boat.hull=1;
  o.boat.cargo=[{species:'silver-bell',value:12},{species:'silver-bell',value:12}];
  o.threat={start:{x:19,y:54},end:{x:8,y:54},width:3.5,resolvesIn:1};
  o.legalActions=['wait','return','move:N:rush'];
  assert.equal(chooseBaselineAction(o).id,'move:N:rush');
});
test('replay rejects fabricated runner stops after a real terminal return',async()=>{
  const trace=await runEpisode({player:'baseline',seed:101,scenario:'A',maxSteps:100,maxInvalidActions:3});
  assert.equal(trace.result.outcome.reason,'returned');
  const altered=structuredClone(trace);altered.result.runnerStop='step_limit';
  altered.result.outcome={terminal:true,reason:'runner_limit',returned:false,success:false,score:0,delivered:[]};
  assert.equal(replayTrace(altered).verified,false);
});
test('replay enforces actual nonterminal stop boundary and summary metadata',async()=>{
  const trace=await runEpisode({player:'baseline',seed:101,scenario:'A',maxSteps:1,maxInvalidActions:3});
  assert.equal(trace.result.runnerStop,'step_limit');assert.equal(replayTrace(trace).verified,true);
  const premature=structuredClone(trace);premature.config.maxSteps=100;
  assert.equal(replayTrace(premature).verified,false);
  const fields=['steps','invalidActions','calls','failedCalls','fallbacks','latencyMs','deliveredValue','hull','seed','repetition'] as const;
  for(const key of fields){
    const altered=structuredClone(trace);altered.result[key]+=1;
    assert.equal(replayTrace(altered).verified,false,`changed ${key} must be rejected`);
  }
  const condition=structuredClone(trace);condition.result.live=true;
  assert.equal(replayTrace(condition).verified,false);
  const prompt=structuredClone(trace);prompt.result.promptVersion='invented-prompt';
  assert.equal(replayTrace(prompt).verified,false);
});
test('baseline starts with weak discovery and escalates only after an empty weak sweep',()=>{
  const o=createGame(101,'A').observe();
  assert.equal(chooseBaselineAction(o).id,'ping:weak');
  const later=structuredClone(o);later.tick=3;later.remaining-=3;
  assert.equal(chooseBaselineAction(later,[{observation:o,action:{id:'ping:weak'}}]).id,'ping:strong');
});
test('baseline safely finishes a catch before the slack threshold can discard its window',()=>{
  const o=createGame(101,'A').observe();o.phase='FISHING';
  o.fishing={species:'silver-bell',progress:76,tension:68,cue:'tired',lineEnd:{x:20,y:50}};
  o.legalActions=['reel:strong','reel:steady','reel:slack','evade:N'];
  assert.equal(chooseBaselineAction(o).id,'reel:strong');
});
