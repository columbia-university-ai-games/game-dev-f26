import {DIRECTIONS,type Vec2,type Direction,type Species,type ScenarioId,type FishCue,type PublicMap,type PublicObservation,type ScenarioInfo,type Contact,type PublicEvent,type PublicBeacon,type Threat,type Cargo,type Outcome} from './types.ts';
import {distance,clamp,rounded,bearing,translated,canNavigate,navigateStep,sample,segmentDistance,VECTORS} from './math.ts';

export const SCENARIOS:ScenarioInfo[]=[
 {id:'A',name:'近岸回声',subtitle:'先听见海，再带两条鱼回家。',budget:68,quota:2},
 {id:'B',name:'礁角之约',subtitle:'把声音留在别处，为自己争取窗口。',budget:76,quota:2},
 {id:'C',name:'最后一竿星光',subtitle:'夜将尽，已得的渔获值得保护。',budget:54,quota:2}
];
export const SPECIES:Record<Species,{name:string;value:number;color:string}>={
 'silver-bell':{name:'银铃鱼',value:12,color:'#65e2cf'},
 reefback:{name:'礁背鱼',value:22,color:'#eabf70'},
 glassfin:{name:'玻璃鳍',value:30,color:'#aebcff'}
};
export const MAP:PublicMap={width:100,height:70,harbor:{x:12,y:54},harborRadius:5,reefs:[
 [{x:34,y:32},{x:42,y:32},{x:46,y:38},{x:40,y:45},{x:34,y:42}],
 [{x:62,y:13},{x:69,y:11},{x:75,y:17},{x:71,y:23},{x:65,y:22}],
 [{x:72,y:55},{x:79,y:51},{x:85,y:56},{x:83,y:62},{x:75,y:62}]
]};
interface Sound {position:Vec2;strength:number;profile:'chime'|'drone'|'pulse'|'engine'|'struggle';kind:'beacon'|'sonar'|'boat'|'fish';}
export interface Fish {id:string;species:Species;position:Vec2;home:Vec2;caught:boolean;spookUntil:number;target:Vec2|null;interest:number;}
interface Beacon {id:string;position:Vec2;profile:'chime'|'drone';startTick:number;endTick:number;}
export interface WorldState {
 seed:number;tick:number;scenario:ScenarioInfo;map:PublicMap;
 boat:{position:Vec2;heading:Direction;hull:number;maxHull:number;beaconsLeft:number;cargo:Cargo[]};
 fish:Fish[];beacons:Beacon[];contacts:Contact[];events:PublicEvent[];
 fishing:null|{fishId:string;progress:number;tension:number;cue:FishCue};
 predator:{position:Vec2;mode:'PATROL'|'INVESTIGATE'|'SEARCH'|'WINDUP'|'RECOVER';target:Vec2|null;interest:number;timer:number;patrolIndex:number};
 threat:Threat|null;result:Outcome;invalidActions:number;
}
const clone=<T>(v:T):T=>structuredClone(v);
const emptyOutcome=():Outcome=>({terminal:false,reason:null,returned:false,success:false,score:0,delivered:[]});
export function createWorld(seed:number,scenario:ScenarioId='A'):WorldState {
 const info=SCENARIOS.find(s=>s.id===scenario);if(!info)throw new Error('Unknown public scenario');
 const layouts:Record<ScenarioId,Array<[Species,number,number]>>={
 A:[['silver-bell',27,51],['silver-bell',33,51],['reefback',51,46],['glassfin',77,34],['silver-bell',58,30],['reefback',84,44]],
 B:[['silver-bell',29,48],['reefback',48,45],['reefback',54,34],['glassfin',80,35],['silver-bell',54,28],['glassfin',84,46]],
 C:[['silver-bell',28,50],['reefback',49,48],['glassfin',64,38],['silver-bell',58,26],['reefback',83,41],['glassfin',84,31]]};
 const fish=layouts[scenario].map(([species,x,y],i)=>{const position=rounded({x:x+(sample(seed,`fish-${i}-x`)-.5)*3,y:y+(sample(seed,`fish-${i}-y`)-.5)*3});return {id:`fish-${i}`,species,position,home:{...position},caught:false,spookUntil:0,target:null,interest:0};});
 return {seed,tick:0,scenario:clone(info),map:clone(MAP),boat:{position:{...MAP.harbor},heading:'E',hull:3,maxHull:3,beaconsLeft:3,cargo:[]},fish,beacons:[],contacts:[],events:[],fishing:null,
 predator:{position:scenario==='A'?{x:78,y:28}:scenario==='B'?{x:65,y:36}:{x:57,y:32},mode:'PATROL',target:null,interest:0,timer:0,patrolIndex:0},threat:null,result:emptyOutcome(),invalidActions:0};
}
function emit(w:WorldState,kind:string,text:string,position?:Vec2,intensity?:number){w.events.push({kind,text,...(position?{position:rounded(position)}:{}),...(intensity!==undefined?{intensity}:{})});}
function destinations(w:WorldState,prefix:string,speed:number):string[]{return DIRECTIONS.filter(d=>canNavigate(w.boat.position,translated(w.boat.position,d,speed),w.map)).map(d=>`${prefix}:${d}`);}
export function legalActions(w:WorldState):string[]{
 if(w.result.terminal)return [];
 if(w.fishing)return ['wait','reel:steady','reel:strong','reel:slack',...destinations(w,'evade',8)];
 const moves=DIRECTIONS.flatMap(d=>(['quiet','rush'] as const).filter(mode=>canNavigate(w.boat.position,translated(w.boat.position,d,mode==='quiet'?4:7),w.map)).map(mode=>`move:${d}:${mode}`));
 return ['wait',...moves,'ping:weak','ping:strong',...(w.boat.beaconsLeft>0?['beacon:chime:0','beacon:chime:2','beacon:drone:0','beacon:drone:2']:[]),...DIRECTIONS.map(d=>`cast:${d}`),...(distance(w.boat.position,w.map.harbor)<=w.map.harborRadius?['return']:[])];
}
function addContacts(w:WorldState,strong:boolean){
 const range=strong?45:24;let index=0;
 for(const fish of w.fish){if(fish.caught||distance(fish.position,w.boat.position)>range)continue;
  const err=strong?1.5:2.8;const pos=rounded({x:fish.position.x+(sample(w.seed,`echo-x-${fish.id}`,w.tick)-.5)*err,y:fish.position.y+(sample(w.seed,`echo-y-${fish.id}`,w.tick)-.5)*err});
  w.contacts.push({id:`echo-${w.tick}-${index++}`,tick:w.tick,position:pos,uncertainty:err,hint:'fish-school',...(strong?{species:fish.species}:{})});
 }
 if(distance(w.predator.position,w.boat.position)<=range)w.contacts.push({id:`echo-${w.tick}-${index}`,tick:w.tick,position:rounded({x:w.predator.position.x+1,y:w.predator.position.y-1}),uncertainty:strong?3:5,hint:'large-anomaly'});
 emit(w,'sonar',strong?'强脉冲照亮更远海域，也会惊动水下的听者。':'弱脉冲已返回。光点是刚才的位置，不是实时追踪。',w.boat.position,strong?7:2.2);
}
function finish(w:WorldState,reason:Outcome['reason']){
 const returned=reason==='returned';const delivered=returned?clone(w.boat.cargo):[];
 const success=returned&&delivered.length>=w.scenario.quota;
 w.result={terminal:true,reason,returned,success,delivered,score:delivered.reduce((n,f)=>n+f.value,0)+(success?40:0)};
 emit(w,'terminal',returned?(success?'任务完成。渔获已入港。':'安全返航，当前渔获已交付。'):reason==='sunk'?'小船失去浮力，未交付的渔获遗失。':'夜色退去，尚未返航的渔获未能交付。');
}
function fleeFish(w:WorldState,fish:Fish){fish.spookUntil=w.tick+5;fish.target=null;fish.interest=0;const d=bearing(w.boat.position,fish.position);const candidate=translated(fish.position,d,5);if(canNavigate(fish.position,candidate,w.map,.5))fish.position=candidate;}
function resolveFishing(w:WorldState,style:string,sounds:Sound[]){
 const f=w.fishing;if(!f)return;const fish=w.fish.find(v=>v.id===f.fishId)!;
 const cue=f.cue;
 if(style==='strong'){f.progress+=38;f.tension+=cue==='tired'?14:cue==='burst'?40:25;}
 else if(style==='slack'){f.progress=Math.max(0,f.progress-5);f.tension=Math.max(0,f.tension-28);}
 else if(style==='steady'){f.progress+=20;f.tension+=cue==='tired'?2:cue==='burst'?15:8;}
 else f.tension+=cue==='burst'?8:3;
 const strength=(style==='strong'?4.8:style==='steady'?1.4:.4)+(cue==='burst'?1.5:cue==='tired'?.6:1);
 sounds.push({position:{...w.boat.position},strength,profile:'struggle',kind:'fish'});
 emit(w,'reel',style==='strong'?'强收：争取时间，挣扎声也更响。':style==='slack'?'放线缓冲：张力回落，时间仍在推进。':style==='steady'?'稳收：低声接近收获。':'鱼仍在挣扎。',w.boat.position,strength);
 if(f.tension>=100){fleeFish(w,fish);w.fishing=null;emit(w,'line_break','鱼线绷断了。鱼带着水花逃向深处。',w.boat.position);}
 else if(f.progress>=100){fish.caught=true;w.boat.cargo.push({species:fish.species,value:SPECIES[fish.species].value});w.fishing=null;emit(w,'caught',`${SPECIES[fish.species].name}已入船舱。带回港口才算交付。`,w.boat.position);}
 else {const r=sample(w.seed,`cue-${fish.id}`,w.tick);f.cue=r<.35?'tired':r<.77?'pulling':'burst';}
}
function fishResponse(w:WorldState,sounds:Sound[]){
 for(const fish of w.fish){if(fish.caught||fish.id===w.fishing?.fishId)continue;
  const heard=sounds.map(s=>{const pref=fish.species==='silver-bell'?(s.profile==='chime'?1.5:s.profile==='drone'?.4:.7):fish.species==='reefback'?(s.profile==='drone'?1.5:.6):.35;return {s,level:s.strength/Math.pow(1+distance(fish.position,s.position)/10,2),interest:s.strength*pref/Math.pow(1+distance(fish.position,s.position)/10,2)};}).sort((a,b)=>b.interest-a.interest);
  const loud=heard.find(h=>h.level>(fish.species==='glassfin'?.8:fish.species==='silver-bell'?2.4:5));
  fish.interest*=.72;
  let target:Vec2=fish.home,speed=.6;
  if(loud&&fish.species!=='reefback'){const dx=fish.position.x-loud.s.position.x,dy=fish.position.y-loud.s.position.y;const len=Math.hypot(dx,dy)||1;target={x:clamp(fish.position.x+dx/len*8,3,97),y:clamp(fish.position.y+dy/len*8,3,67)};speed=2;fish.spookUntil=w.tick+2;fish.target=null;fish.interest=0;}
  else {
   if(heard[0]?.interest>Math.max(.18,fish.interest*1.35)&&fish.spookUntil<=w.tick){fish.target={...heard[0].s.position};fish.interest=heard[0].interest;}
   if(fish.target&&fish.interest>.08&&fish.spookUntil<=w.tick){target=fish.target;speed=1.7;}
   else {fish.target=null;target={x:fish.home.x+Math.sin((w.tick+Number(fish.id.slice(5))*3)*.27)*3,y:fish.home.y+Math.cos((w.tick+Number(fish.id.slice(5)))*.23)*2};}
  }
  fish.position=navigateStep(fish.position,target,speed,w.map,.45);
 }
}
function predatorResponse(w:WorldState,sounds:Sound[],oldThreat:Threat|null){
 const p=w.predator;
 // Only attacks visible before this action can resolve; the corridor never homes.
 if(oldThreat){
  if(segmentDistance(w.boat.position,oldThreat.start,oldThreat.end)<=oldThreat.width){
   if(w.fishing){const fish=w.fish.find(f=>f.id===w.fishing!.fishId)!;fleeFish(w,fish);w.fishing=null;emit(w,'fish_stolen','巡声者掠过鱼线，夺走了这一口。小船暂未受伤。',w.boat.position);}
   else {w.boat.hull=Math.max(0,w.boat.hull-1);emit(w,'damage','冲撞命中，船体受损。',w.boat.position);}
  }else emit(w,'attack_missed','冲撞擦过预告水域。你争取到了脱离窗口。',oldThreat.end);
  p.position=navigateStep(p.position,oldThreat.end,6,w.map,1);p.mode='RECOVER';p.timer=2;p.interest=0;w.threat=null;return;
 }
 if(p.mode==='RECOVER'){p.timer--;if(p.timer<=0)p.mode='PATROL';return;}
 p.interest*=.72;
 const heard=sounds.map(s=>({s,interest:s.strength*(s.profile==='drone'?1.25:s.profile==='chime'?.85:1)/Math.pow(1+distance(p.position,s.position)/12,2)})).sort((a,b)=>b.interest-a.interest);
 if(heard[0]&&heard[0].interest>Math.max(.2,p.interest*1.35)){
  p.target={...heard[0].s.position};p.interest=heard[0].interest;p.mode='INVESTIGATE';p.timer=0;
 }
 if(distance(p.position,w.boat.position)<=8){
  const toward=w.boat.position;const d=distance(p.position,toward)||1;
  w.threat={start:rounded(p.position),end:rounded({x:toward.x+(toward.x-p.position.x)/d*3,y:toward.y+(toward.y-p.position.y)/d*3}),width:3.5,resolvesIn:1};
  p.mode='WINDUP';emit(w,'windup','水面形成一道冲撞通道。下一次行动后，它将掠过这里。',toward);return;
 }
 if(p.mode==='INVESTIGATE'&&p.target){p.position=navigateStep(p.position,p.target,3.2,w.map,1);if(distance(p.position,p.target)<3){p.mode='SEARCH';p.timer=3;}}
 else if(p.mode==='SEARCH'){p.timer--;if(p.timer<=0){p.mode='PATROL';p.target=null;p.interest=0;}}
 else {
  const patrol=[{x:79,y:29},{x:57,y:25},{x:53,y:48},{x:87,y:44}];const target=patrol[p.patrolIndex%patrol.length];p.position=navigateStep(p.position,target,1.4,w.map,1);if(distance(p.position,target)<3)p.patrolIndex++;
 }
}
export function applyAction(w:WorldState,id:string):boolean {
 if(!legalActions(w).includes(id))return false;
 const parts=id.split(':');const oldThreat=clone(w.threat);const sounds:Sound[]=[];w.events=[];
 if(id==='return'){w.tick++;if(oldThreat)predatorResponse(w,[],oldThreat);if(w.boat.hull<=0)finish(w,'sunk');else finish(w,'returned');return true;}
 if(parts[0]==='move'){w.boat.position=translated(w.boat.position,parts[1] as Direction,parts[2]==='rush'?7:4);w.boat.heading=parts[1] as Direction;sounds.push({position:{...w.boat.position},strength:parts[2]==='rush'?3.5:.55,profile:'engine',kind:'boat'});emit(w,'move',parts[2]==='rush'?'急行：离开更快，也留下更响的航迹。':'低速航行。',w.boat.position,parts[2]==='rush'?3.5:.55);}
 else if(parts[0]==='ping'){addContacts(w,parts[1]==='strong');sounds.push({position:{...w.boat.position},strength:parts[1]==='strong'?7:2.2,profile:'pulse',kind:'sonar'});}
 else if(parts[0]==='beacon'){const startTick=w.tick+1+Number(parts[2]);w.beacons.push({id:`beacon-${3-w.boat.beaconsLeft}`,position:{...w.boat.position},profile:parts[1] as 'chime'|'drone',startTick,endTick:startTick+7});w.boat.beaconsLeft--;emit(w,'deploy',`声标已留下，${parts[2]==='0'?'即刻':parts[2]+'步后'}发声。`,w.boat.position);}
 else if(parts[0]==='cast'){
  w.boat.heading=parts[1] as Direction;const v=VECTORS[parts[1] as Direction];
  const fish=w.fish.filter(f=>!f.caught&&f.spookUntil<=w.tick&&distance(f.position,w.boat.position)<=10&&canNavigate(w.boat.position,f.position,w.map,.1)&&((f.position.x-w.boat.position.x)*v.x+(f.position.y-w.boat.position.y)*v.y)/(distance(f.position,w.boat.position)||1)>=Math.SQRT1_2).sort((a,b)=>distance(a.position,w.boat.position)-distance(b.position,w.boat.position))[0];
  if(fish){w.fishing={fishId:fish.id,progress:0,tension:15,cue:'tired'};emit(w,'hooked',`${SPECIES[fish.species].name}上钩。第一口挣扎会在下一次操作时结算。`,fish.position);}
  else emit(w,'empty_cast','浮漂没有动静。这一竿消耗了时间。',translated(w.boat.position,parts[1] as Direction,8));
 }
 else if(parts[0]==='evade'){
  if(w.fishing){const fish=w.fish.find(f=>f.id===w.fishing!.fishId)!;fleeFish(w,fish);}w.fishing=null;
  w.boat.position=translated(w.boat.position,parts[1] as Direction,8);w.boat.heading=parts[1] as Direction;sounds.push({position:{...w.boat.position},strength:4,profile:'engine',kind:'boat'});emit(w,'evade','切线并急避。当前鱼已放弃，船舱里的渔获仍在。',w.boat.position,4);
 }
 else if(parts[0]==='reel'||(id==='wait'&&w.fishing))resolveFishing(w,parts[1]??'wait',sounds);
 else emit(w,'wait','你留出片刻，听海域继续变化。');
 w.tick++;
 w.beacons=w.beacons.filter(b=>w.tick<b.endTick);
 for(const b of w.beacons){if(w.tick>=b.startTick){const strength=b.profile==='chime'?3:5;sounds.push({position:{...b.position},strength,profile:b.profile,kind:'beacon'});emit(w,'beacon_sound',b.profile==='chime'?'轻鸣声标正在发声。':'低鸣声标正在发声。',b.position,strength);}}
 fishResponse(w,sounds);predatorResponse(w,sounds,oldThreat);
 w.contacts=w.contacts.filter(c=>w.tick-c.tick<=9);
 if(w.boat.hull<=0)finish(w,'sunk');else if(w.tick>=w.scenario.budget)finish(w,'night_expired');
 return true;
}
export function project(w:WorldState):PublicObservation {
 const fish=w.fishing?w.fish.find(f=>f.id===w.fishing!.fishId):null;
 const predDistance=distance(w.predator.position,w.boat.position);
 const beacons:PublicBeacon[]=w.beacons.map(b=>({id:b.id,position:{...b.position},profile:b.profile,startsIn:Math.max(0,b.startTick-w.tick),life:Math.max(0,b.endTick-Math.max(w.tick,b.startTick)),active:w.tick>=b.startTick}));
 return clone({schemaVersion:1,tick:w.tick,phase:w.result.terminal?'TERMINAL':w.fishing?'FISHING':'EXPLORING',scenario:w.scenario,map:w.map,boat:w.boat,remaining:Math.max(0,w.scenario.budget-w.tick),
 contacts:w.contacts.map(c=>({...c,uncertainty:c.uncertainty+(w.tick-c.tick)*.7})),beacons,
 fishing:w.fishing&&fish?{species:fish.species,progress:w.fishing.progress,tension:w.fishing.tension,cue:w.fishing.cue,lineEnd:{...fish.position}}:null,
 threat:w.threat,warning:predDistance<=22?{bearing:bearing(w.boat.position,w.predator.position),urgency:predDistance<=12?'near':'distant'}:null,
 events:w.events,legalActions:legalActions(w),outcome:w.result});
}
