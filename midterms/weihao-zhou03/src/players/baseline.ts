import { DIRECTIONS, type Action, type Direction, type PublicMap, type PublicObservation, type Vec2 } from '../core/types.ts';
import { canNavigate, distance, segmentDistance, translated, VECTORS } from '../core/math.ts';

/** Public policy history, never an engine/state handle. */
export interface PublicTurn { observation: PublicObservation; action: Action; }
export const BASELINE_VERSION = 'echo-window-4';

/** Visibility-graph navigation over public reef vertices; the engine alone validates movement. */
function routeDistance(a: Vec2, target: Vec2, map: PublicMap): number {
  if (canNavigate(a,target,map)) return distance(a,target);
  const corners=map.reefs.flatMap(poly=>{
    const center={x:poly.reduce((s,p)=>s+p.x,0)/poly.length,y:poly.reduce((s,p)=>s+p.y,0)/poly.length};
    return poly.map(p=>{
      const n=distance(p,center)||1;
      return {x:p.x+(p.x-center.x)/n*3,y:p.y+(p.y-center.y)/n*3};
    });
  });
  const nodes=[a,target,...corners];const costs=nodes.map(()=>Infinity);costs[0]=0;
  const visited=new Set<number>();
  for(let count=0;count<nodes.length;count++){
    let best=-1;
    for(let i=0;i<nodes.length;i++) if(!visited.has(i)&&(best<0||costs[i]<costs[best])) best=i;
    if(best===1||best<0||!Number.isFinite(costs[best])) break;
    visited.add(best);
    for(let j=0;j<nodes.length;j++) if(!visited.has(j)&&canNavigate(nodes[best],nodes[j],map))
      costs[j]=Math.min(costs[j],costs[best]+distance(nodes[best],nodes[j]));
  }
  return costs[1];
}

export function corridorDistance(p: Vec2, a: Vec2, b: Vec2): number {
  return segmentDistance(p,a,b);
}

function travel(o:PublicObservation,target:Vec2,rush=false):Action{
  const options=o.legalActions.filter(id=>id.startsWith(`move:`)&&id.endsWith(rush?':rush':':quiet'));
  const evaluate=(id:string)=>{
    const p=translated(o.boat.position,id.split(':')[1] as Direction,rush?7:4);
    let score=routeDistance(p,target,o.map);
    if(o.threat&&corridorDistance(p,o.threat.start,o.threat.end)<o.threat.width+0.5) score+=100;
    return score;
  };
  options.sort((a,b)=>evaluate(a)-evaluate(b));
  return {id:options[0]??o.legalActions.find(id=>id.startsWith('move:'))??'wait'};
}

function escape(o:PublicObservation):Action{
  const options=o.legalActions.filter(id=>id.startsWith('evade:')||id.startsWith('move:'));
  options.sort((a,b)=>{
    const score=(id:string)=>{
      const parts=id.split(':');
      const length=parts[0]==='evade'?8:parts[2]==='rush'?7:4;
      const p=translated(o.boat.position,parts[1] as Direction,length);
      const safety=o.threat?corridorDistance(p,o.threat.start,o.threat.end):0;
      return safety*10-distance(p,o.map.harbor)*0.1;
    };return score(b)-score(a);
  });return {id:options[0]??'reel:slack'};
}

/** A bounded acoustic-window policy using only public echoes, map, cues and history. */
export function chooseBaselineAction(o:PublicObservation,history:PublicTurn[]=[]):Action{
  if(o.outcome.terminal) return {id:'wait'};
  const legal=(id:string)=>o.legalActions.includes(id);
  const homeDistance=routeDistance(o.boat.position,o.map.harbor,o.map);
  const reserve=Math.ceil(homeDistance/4)+4;
  if(o.phase==='FISHING'&&o.fishing){
    const f=o.fishing;
    const predicted=f.tension+(f.cue==='tired'?14:f.cue==='burst'?40:25);
    const canFinish=f.progress+38>=100&&predicted<100;
    if(o.threat){
      const inCorridor=corridorDistance(o.boat.position,o.threat.start,o.threat.end)<o.threat.width+0.5;
      if(inCorridor&&(!canFinish||o.boat.hull<=1)) return escape(o);
    }
    if(o.remaining<=reserve||o.boat.hull<=1&&o.warning?.urgency==='near') return escape(o);
    if(canFinish) return {id:'reel:strong'};
    if(f.tension>=68||f.cue==='burst'&&f.tension>=42) return {id:'reel:slack'};
    if(f.cue==='tired'&&predicted<=78||o.warning?.urgency==='near'&&predicted<=80)
      return {id:'reel:strong'};
    return {id:'reel:steady'};
  }
  // A return is still an action inside the announced corridor; reaching port is not immunity.
  if(o.threat&&corridorDistance(o.boat.position,o.threat.start,o.threat.end)<o.threat.width+0.5) return escape(o);
  const returnNow=o.boat.cargo.length>=o.scenario.quota||o.remaining<=reserve||o.boat.hull<=1&&o.boat.cargo.length>0;
  if(returnNow){
    if(legal('return')) return {id:'return'};
    return travel(o,o.map.harbor,o.remaining<=Math.ceil(homeDistance/4)+2);
  }
  const lastPing=[...history].reverse().find(t=>t.action.id.startsWith('ping:'));
  const lastCast=[...history].reverse().find(t=>t.action.id.startsWith('cast:'));
  const lastBeacon=[...history].reverse().find(t=>t.action.id.startsWith('beacon:'));
  const contacts=o.contacts.filter(c=>c.hint==='fish-school'&&o.tick-c.tick<=5)
    .sort((a,b)=>(distance(o.boat.position,a.position)+a.uncertainty*1.2)-(distance(o.boat.position,b.position)+b.uncertainty*1.2));
  // Refresh after a missed cast, or after the echo has grown too stale to place a reliable cast.
  if(lastCast&&lastCast.observation.tick===o.tick-1||!contacts.length){
    if(!lastPing||o.tick-lastPing.observation.tick>=3){
      const strong=!o.warning&&lastPing?.action.id==='ping:weak'&&!contacts.length;
      return {id:strong?'ping:strong':'ping:weak'};
    }
  }
  if(contacts.length){
    const target=contacts[0],dist=distance(o.boat.position,target.position);
    if(dist>8) return travel(o,target.position,false);
    // A delayed chime creates an attraction window before casting; no hidden target coordinates.
    if(o.boat.beaconsLeft>0&&(!lastBeacon||o.tick-lastBeacon.observation.tick>10)&&legal('beacon:chime:2'))
      return {id:'beacon:chime:2'};
    const dx=target.position.x-o.boat.position.x,dy=target.position.y-o.boat.position.y;
    const candidates=DIRECTIONS.filter(d=>legal(`cast:${d}`));
    candidates.sort((a,b)=>{
      const ua=VECTORS[a],ub=VECTORS[b];return ub.x*dx+ub.y*dy-(ua.x*dx+ua.y*dy);
    });
    if(candidates.length) return {id:`cast:${candidates[0]}`};
  }
  // Search public acoustic activity around the bay, rather than oscillating at port.
  const target=o.beacons.find(b=>b.active)?.position??{x:o.map.width*0.5,y:o.map.height*0.55};
  return travel(o,target,false);
}

export const baseline=chooseBaselineAction;
