/* Deterministic stamp/session rules. Randomness is injected only at delivery. */
(function(root){
 'use strict';
 const core=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.GetOut;
 const labels=['stop','turn','detour'],dirs={up:[-1,0],right:[0,1],down:[1,0],left:[0,-1]};
 const key=p=>p.join(','),copy=p=>p.slice(),same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
 const base=s=>({board:s.board,position:s.position,moves:s.moves,won:s.won});
 function reachable(board){
  const queue=[core.create(board)],seen=new Set([key(queue[0].position)]);
  for(let i=0;i<queue.length;i++)for(const action of core.legalActions(queue[i])){
   const next=core.step(queue[i],action),id=key(next.position);if(!seen.has(id)){seen.add(id);queue.push(next);}
  }
  return queue;
 }
 function validate(board,stamps){
  const first=core.create(board);if(core.solve(first)===null)throw new Error('This board has no escape route. Change the walls, start, or exit.');
  if(!Array.isArray(stamps)||stamps.length>2)throw new Error('Use at most two author stamps.');
  const stops=new Set(reachable(board).map(s=>key(s.position))),used=new Set();
  return stamps.map(stamp=>{
   if(!stamp||!Array.isArray(stamp.position)||stamp.position.length!==2||!stamp.position.every(Number.isInteger))throw new Error('Each stamp needs a valid row and column.');
   const [r,c]=stamp.position,id=key(stamp.position);
   if(r<0||r>=board.length||c<0||c>=board[0].length||board[r][c]!=='.')throw new Error('Put stamps on floor, not on the start, exit, or a wall.');
   if(!stops.has(id))throw new Error(`Row ${r+1}, column ${c+1} is not a reachable stopping point.`);
   if(used.has(id))throw new Error('Use one stamp per stopping point.');
   if(!labels.includes(stamp.label))throw new Error('Choose Stop, Turn, or Detour.');
   used.add(id);return {position:copy(stamp.position),label:stamp.label};
  });
 }
 function parse(text){
  if(typeof text!=='string'||text.length>32768)throw new Error('Use a complete board code of at most 32,768 characters.');
  const raw=text.trim();let board,stamps=[];
  if(raw.startsWith('{')){
   let data;try{data=JSON.parse(raw);}catch{throw new Error('Incomplete stamp code. Copy the whole code and try again.');}
   if(!data||data.format!=='misdelivered-stamp-v1')throw new Error('Use a Misdelivered Stamp code or original plain board text.');
   board=data.board;stamps=data.stamps;
  }else board=raw.split(/\r?\n/).map(row=>row.trim());
  return {board:core.create(board).board,stamps:validate(board,stamps)};
 }
 function encode(board,stamps){return JSON.stringify({format:'misdelivered-stamp-v1',board:core.create(board).board,stamps:validate(board,stamps)},null,2);}
 function create(board,stamps=[]){
  const checked=validate(board,stamps),s=core.create(board);
  return {...s,stamps:checked,round:1,resetCount:0,hints:0,misdeliveries:0,stops:[],undoStack:[],results:{},judgments:[],events:[],eligible:null,pending:null,arrival:null};
 }
 const event=(s,type,data={})=>[...s.events,{type,round:s.round,...data}];
 function free(s){if(s.pending)throw new Error(s.pending.phase==='preview'?'Confirm the position change before continuing.':'Choose a label or continue without judging.');}
 function move(s,action){
  free(s);if(s.won)return s;
  const previous=base(s),next=core.step(previous,action),changed=next!==previous;
  let events=event(s,'move',{action,from:copy(s.position),to:copy(next.position),blocked:!changed,won:next.won});
  if(!changed)return {...s,events};
  if(s.eligible)events.push({type:'skip',round:s.round,stamp:s.eligible,method:'moved-on'});
  const id=key(next.position),eligible=!next.won&&s.stamps.some(t=>key(t.position)===id)&&!s.results[id]?id:null;
  if(eligible)events.push({type:'offer',round:s.round,stamp:id});
  return {...s,...next,events,stops:[...s.stops,copy(next.position)],undoStack:[...s.undoStack,{kind:'slide',...previous,position:copy(previous.position)}],eligible,arrival:action};
 }
 function open(s){
  free(s);if(!s.eligible||s.results[s.eligible]||!s.stamps.some(t=>key(t.position)===s.eligible&&same(t.position,s.position)))throw new Error('Normally stop on an unused stamp before opening it.');
  return {...s,pending:{phase:'choice',stamp:s.eligible},events:event(s,'open',{stamp:s.eligible})};
 }
 function skip(s){
  if(s.pending&&s.pending.phase==='preview')throw new Error('Confirm the position change first.');
  const id=s.pending?.stamp??s.eligible;if(!id)return s;
  return {...s,pending:null,eligible:null,events:event(s,'skip',{stamp:id,method:'continue'})};
 }
 function candidates(s){
  const result=[],seen=new Set([key(s.position)]);
  for(let i=s.stops.length-1;i>=0&&result.length<3;i--){const id=key(s.stops[i]);if(!seen.has(id)){seen.add(id);result.push(copy(s.stops[i]));}}
  if(!result.length)result.push(copy(core.create(s.board).position));return result;
 }
 function guess(s,label){
  if(s.pending?.phase!=='choice'||!labels.includes(label))throw new Error('Open a stamp and choose one of its three labels.');
  const stamp=s.stamps.find(t=>key(t.position)===s.pending.stamp),id=key(stamp.position);
  if(s.results[id])throw new Error('This stamp has already been judged this round.');
  const judgment={stamp:id,round:s.round,guess:label,author:stamp.label,match:label===stamp.label,first:!s.judgments.some(j=>j.stamp===id)};
  const next={...s,judgments:[...s.judgments,judgment],results:{...s.results,[id]:judgment},eligible:null,pending:null,events:event(s,'judgment',judgment)};
  if(!judgment.match){const pool=candidates(s);next.pending={phase:'preview',stamp:id,candidates:pool};next.events.push({type:'preview',round:s.round,candidates:pool.map(copy)});}
  return next;
 }
 function deliver(s,random=Math.random){
  if(s.pending?.phase!=='preview')throw new Error('There is no position change awaiting confirmation.');
  const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw new Error('Random choice must be in [0, 1).');
  const destination=copy(s.pending.candidates[Math.floor(value*s.pending.candidates.length)]),id=s.pending.stamp;
  const judgments=s.judgments.map(j=>j.stamp===id&&j.round===s.round?{...j,destination:copy(destination)}:j);
  return {...s,position:destination,won:false,eligible:null,pending:null,arrival:null,misdeliveries:s.misdeliveries+1,
   undoStack:[...s.undoStack,{kind:'teleport',...base(s),position:copy(s.position)}],judgments,results:{...s.results,[id]:{...s.results[id],destination:copy(destination)}},
   events:event(s,'teleport',{from:copy(s.position),to:copy(destination),stamp:id})};
 }
 function undo(s){
  free(s);if(!s.undoStack.length)return s;
  const last=s.undoStack[s.undoStack.length-1];
  return {...s,position:copy(last.position),moves:last.moves,won:last.won,undoStack:s.undoStack.slice(0,-1),eligible:null,arrival:null,events:event(s,'undo',{kind:last.kind,to:copy(last.position)})};
 }
 function reset(s){
  free(s);return {...create(s.board,s.stamps),round:s.round+1,resetCount:s.resetCount+1,judgments:s.judgments.slice(),events:event(s,'reset',{nextRound:s.round+1})};
 }
 function hint(s){
  free(s);if(s.won)return s;
  const path=core.solve(base(s)),message=path===null?'No escape route from here. Undo or reset.':`Try ${path[0]}. Stamps are optional.`;
  return {...s,hints:s.hints+1,events:event(s,'hint',{message}),message};
 }
 function stats(s){
  const first={matches:0,attempts:0},retry={matches:0,attempts:0},seen=new Set();
  for(const j of s.judgments){const bucket=seen.has(j.stamp)?retry:first;bucket.attempts++;if(j.match)bucket.matches++;seen.add(j.stamp);}
  return {round:{matches:Object.values(s.results??{}).filter(j=>j.match).length,judged:Object.keys(s.results??{}).length,total:s.stamps.length},first,retry};
 }
 function geometry(board,position,arrival=null){
  const contacts=[],used=new Set(),exitLines=[];
  for(const state of reachable(board))for(const action of core.legalActions(state)){
   if(arrival&&action!==arrival)continue;const next=core.step(state,action);
   if(!same(next.position,position)||next.won)continue;
   const [dr,dc]=dirs[action],blocker=[position[0]+dr,position[1]+dc],id=action+key(blocker);
   if(used.has(id))continue;used.add(id);
   const boundary=blocker[0]<0||blocker[0]>=board.length||blocker[1]<0||blocker[1]>=board[0].length;
   contacts.push({action,boundary,blocker:boundary?null:blocker,position:copy(position),side:boundary?action:{up:'bottom',right:'left',down:'top',left:'right'}[action]});
  }
  const local={...core.create(board),position:copy(position)};
  for(const action of Object.keys(dirs)){
   const next=core.step(local,action);if(!next.won)continue;
   const [dr,dc]=dirs[action];let [r,c]=position;
   while(r!==next.position[0]||c!==next.position[1]){r+=dr;c+=dc;exitLines.push([r,c]);}
  }
  return {contacts,exitLines};
 }
 function exportTrace(s){return {format:'misdelivered-stamp-trace-v1',board:s.board,stamps:s.stamps,round:s.round,resetCount:s.resetCount,judgments:s.judgments,events:s.events,current:{position:s.position,moves:s.moves,hints:s.hints,misdeliveries:s.misdeliveries,won:s.won},stats:stats(s)};}
 function reviewTrace(text){
  if(typeof text!=='string'||text.length>2000000)throw new Error('Choose a trace file smaller than 2 MB.');
  let data;try{data=JSON.parse(text);}catch{throw new Error('This is not a readable trace file.');}
  if(!data||data.format!=='misdelivered-stamp-trace-v1'||!Number.isSafeInteger(data.resetCount)||data.resetCount<0||data.round!==data.resetCount+1||!Array.isArray(data.judgments)||data.judgments.length>10000)throw new Error('Invalid Misdelivered Stamp trace.');
  const stamps=validate(data.board,data.stamps),seen=new Set(),perRound=new Set();
  const judgments=data.judgments.map(j=>{
   const stamp=stamps.find(t=>key(t.position)===j?.stamp),id=`${j?.round}:${j?.stamp}`;
   if(!stamp||!Number.isSafeInteger(j.round)||j.round<1||j.round>data.round||!labels.includes(j.guess)||j.author!==stamp.label||j.match!==(j.guess===stamp.label)||j.first!==!seen.has(j.stamp)||perRound.has(id))throw new Error('The trace contains inconsistent judgment records.');
   seen.add(j.stamp);perRound.add(id);return {...j};
  });
  const state={stamps,judgments,results:Object.fromEntries(judgments.filter(j=>j.round===data.round).map(j=>[j.stamp,j]))};
  return {resetCount:data.resetCount,round:data.round,judgments,stats:stats(state)};
 }
 const api={labels,key,validate,parse,encode,create,move,open,skip,guess,candidates,deliver,undo,reset,hint,stats,geometry,exportTrace,reviewTrace};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MisdeliveredStamp=api;
})(globalThis);
