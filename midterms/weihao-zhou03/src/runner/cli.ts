import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { replayTrace, runEpisode, type EpisodeTrace, type PlayerKind } from './episode.ts';
import type { ScenarioId } from '../core/types.ts';
import type { ModelConfig } from '../players/model.ts';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const help=`Echo Fishery evaluation (no live requests by default)
  npm run evaluate -- --player baseline|mock --suite dev --repetitions 2
  npm run evaluate -- --player model-current|model-history --suite dev --live
  npm run evaluate -- --player baseline --scenario A --seed 101
  npm run replay -- path/to/public-trace.json
Options: --max-calls 85 --max-steps 85 --timeout-ms 30000 --output eval/runs
Live requires ECHO_API_KEY; optional ECHO_API_BASE (default local 8317/v1), ECHO_MODEL.
Heldout use consumes registered evaluation cases: freeze rule/config/prompt before --suite heldout.`;

export function parseArgs(args:string[]):Map<string,string|boolean>{
  const options=new Map<string,string|boolean>();
  const flags=new Set(['live','help','replay']);
  const values=new Set(['player','suite','repetitions','scenario','seed','max-calls','max-steps','timeout-ms','output']);
  for(let i=0;i<args.length;i++){
    if(!args[i].startsWith('--')){
      if(options.has('replay')&&!options.has('replay-path')){options.set('replay-path',args[i]);continue;}
      throw new Error(`Unexpected positional argument: ${args[i]}`);
    }
    const key=args[i].slice(2);
    if(flags.has(key)){options.set(key,true);continue;}
    if(!values.has(key)) throw new Error(`Unknown option --${key}`);
    if(!args[i+1]||args[i+1].startsWith('--')) throw new Error(`Missing value for --${key}`);
    options.set(key,args[++i]);
  }return options;
}
function numberOption(options:Map<string,string|boolean>,key:string,fallback:number,max=10000){
  const n=Number(options.get(key)??fallback);
  if(!Number.isSafeInteger(n)||n<1||n>max) throw new Error(`--${key} must be an integer in 1..${max}`);
  return n;
}
function revision(){
  try{
    const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
    const dirty=execFileSync('git',['status','--porcelain','--','.'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
    return `${commit}${dirty?'+dirty':''}`;
  }catch{return 'uncommitted-working-tree';}
}
async function main(){
  const opts=parseArgs(process.argv.slice(2));
  if(opts.has('help')){console.log(help);return;}
  if(opts.has('replay')){
    const path=opts.get('replay-path');if(typeof path!=='string') throw new Error('Replay requires a trace JSON path.');
    const trace=JSON.parse(await readFile(resolve(path),'utf8')) as EpisodeTrace;
    if(trace.schemaVersion!==1||trace.kind!=='public-episode'||!Array.isArray(trace.steps)) throw new Error('Not an Echo Fishery public episode trace.');
    const replay=replayTrace(trace);console.log(JSON.stringify(replay));if(!replay.verified) process.exitCode=1;return;
  }
  const player=String(opts.get('player')??'baseline') as PlayerKind;
  if(!['baseline','mock','model-current','model-history'].includes(player)) throw new Error('Unknown --player.');
  const suiteName=String(opts.get('suite')??'dev');
  if(!['dev','heldout'].includes(suiteName)) throw new Error('--suite must be dev or heldout.');
  const suite=JSON.parse(await readFile(resolve(root,'eval/suite.json'),'utf8')) as {
    development:{id:string;scenario:ScenarioId;seed:number}[];heldOut:{id:string;scenario:ScenarioId;seed:number}[];
    liveRepetitionsPerCase:number;historySteps:number;limits:{maxCallsPerEpisode:number;callTimeoutMs:number;maxInvalidActions:number;maxOutputTokens:number};
  };
  const live=player.startsWith('model-');let model:ModelConfig|undefined;
  if(live){
    if(!opts.has('live')) throw new Error('Model requests require --live. Use --player mock for offline transport-free diagnostics.');
    if(!process.env.ECHO_API_KEY) throw new Error('Set ECHO_API_KEY outside the repository; credentials are never read from proxy configuration.');
    const base=process.env.ECHO_API_BASE??'http://127.0.0.1:8317/v1';
    const url=new URL(base);
    if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash)
      throw new Error('ECHO_API_BASE must be an http(s) endpoint without embedded credentials, query or fragment.');
    model={baseUrl:base,model:process.env.ECHO_MODEL??'gpt-6.1-sol',apiKey:process.env.ECHO_API_KEY,
      history:player==='model-history',historySteps:suite.historySteps,
      timeoutMs:numberOption(opts,'timeout-ms',suite.limits.callTimeoutMs,30000),
      maxOutputTokens:suite.limits.maxOutputTokens,maxCalls:numberOption(opts,'max-calls',suite.limits.maxCallsPerEpisode,85)};
  }else if(opts.has('live')) throw new Error('--live is only valid for model-current/model-history.');
  const repetitions=numberOption(opts,'repetitions',live?suite.liveRepetitionsPerCase:1,20);
  let cases=suiteName==='dev'?suite.development:suite.heldOut;
  if(opts.has('scenario')){
    const scenario=String(opts.get('scenario')) as ScenarioId;if(!['A','B','C'].includes(scenario)) throw new Error('--scenario must be A, B or C.');
    cases=[{id:'single',scenario,seed:numberOption(opts,'seed',101,2147483647)}];
  }else if(opts.has('seed')) throw new Error('--seed requires --scenario.');
  if(suiteName==='heldout') console.log('HELDOUT: these registered cases are now exposed; preserve the frozen game/config/prompt and do not tune on results.');
  const out=resolve(root,String(opts.get('output')??`eval/runs/${suiteName}`));await mkdir(out,{recursive:true});
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');const results=[];const gameVersion=revision();
  for(const c of cases) for(let repetition=1;repetition<=repetitions;repetition++){
    const trace=await runEpisode({player,seed:c.seed,scenario:c.scenario,caseId:c.id,repetition,model,gameVersion,
      maxSteps:numberOption(opts,'max-steps',100,200),maxInvalidActions:suite.limits.maxInvalidActions});
    const filename=`${stamp}-${player}-${c.id}-r${repetition}.json`;
    await writeFile(resolve(out,filename),JSON.stringify(trace,null,2)+'\n');
    results.push({...trace.result,trace:filename});
    console.log(JSON.stringify({case:c.id,repetition,player,reason:trace.result.outcome.reason,success:trace.result.outcome.success,
      deliveredValue:trace.result.deliveredValue,steps:trace.result.steps,calls:trace.result.calls,fallbacks:trace.result.fallbacks,trace:filename}));
  }
  const report={schemaVersion:1,label:live?'live-provider-trials':player==='mock'?'offline-mock-diagnostic':'deterministic-baseline',
    createdAt:new Date().toISOString(),suite:suiteName,gameVersion,results};
  await writeFile(resolve(out,`${stamp}-${player}-summary.json`),JSON.stringify(report,null,2)+'\n');
  console.log(`Saved ${results.length} episode(s) to ${out}`);
}
main().catch(error=>{console.error(error instanceof Error?error.message:'Runner failed');process.exitCode=1;});
