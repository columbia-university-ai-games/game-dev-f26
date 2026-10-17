/* Deterministic grid physics. One tick crosses at most one cell. */
(function(root){
 'use strict';
 const directions={up:[-1,0],right:[0,1],down:[1,0],left:[0,-1]};
 function tile(s,p){return s.board[p[0]]?.[p[1]]??'#';}
 function add(p,v){return [p[0]+v[0],p[1]+v[1]];}
 function solid(s,p){return '#T^~'.includes(tile(s,p));}
 function supported(s){return '#T'.includes(tile(s,add(s.position,directions[s.gravity])));}
 function create(board,health=15){
  if(!Array.isArray(board)||board.length<2||board.length>20||typeof board[0]!=='string'||board[0].length<2||board[0].length>20||board.some(r=>typeof r!=='string'||r.length!==board[0].length||/[^.#SE^~T]/.test(r)))throw Error('Use a rectangular 2–20 cell board with S, E, #, ., ^, ~ and T.');
  if(board.join('').split('S').length!==2||board.join('').split('E').length!==2)throw Error('Place exactly one start and exit.');
  if(!Number.isInteger(health)||health<0||health>15)throw Error('Health must be 0–15 thirds.');
  const r=board.findIndex(row=>row.includes('S'));
  const s={board:board.slice(),position:[r,board[r].indexOf('S')],gravity:'down',health,lavaContact:false,grounded:false,rise:0,holdRemaining:0,extended:true,steered:false,won:false,dead:health===0,moves:0,bounceTicks:0,impact:null,event:''};
  s.grounded=supported(s);return s;
 }
 function contact(s,p){
  const target=tile(s,p);
  if(target!=='^'&&target!=='~')return s;
  const impact={kind:target==='^'?'spike':'lava',position:s.position.slice(),gravity:s.gravity,
   normal:[s.position[0]-p[0],s.position[1]-p[1]]};
  if(target==='^')return {...create(s.board,Math.max(0,s.health-3)),moves:s.moves,impact,event:'spike'};
  if(s.lavaContact&&s.bounceTicks>0)return s;
  const health=Math.max(0,s.health-1);
  return {...s,health,lavaContact:true,grounded:false,rise:0,holdRemaining:0,extended:true,
   bounceTicks:2,steered:false,dead:health===0,impact,event:'lava'};
 }
 function enter(s,p){
  const lavaNearby=Object.values(directions).some(v=>tile(s,add(p,v))==='~');
  return {...s,position:p,lavaContact:s.lavaContact&&lavaNearby,won:tile(s,p)==='E',impact:null,event:''};
 }
 function input(s,action){
  if(s.won||s.dead)return s;
  if(action==='jump'){
   if(!s.grounded)return s;
   const trampoline=tile(s,add(s.position,directions[s.gravity]))==='T';
   return {...s,grounded:false,rise:1,holdRemaining:trampoline?3:2,extended:false,steered:false,moves:s.moves+1,bounceTicks:0,impact:null,event:''};
  }
  const gravity=directions[s.gravity];
  const right=[-gravity[1],gravity[0]];
  let side=action==='steer-right'?right:action==='steer-left'?right.map(n=>-n):null;
  if(Object.hasOwn(directions,action)){
   if(s.grounded){
    const changed={...s,gravity:action,rise:0,holdRemaining:0,extended:true,steered:false,bounceTicks:0,impact:null,event:''};
    changed.grounded=supported(changed);
    if(action===s.gravity&&s.grounded)return s;
    return {...changed,moves:s.moves+1};
   }
   const v=directions[action];
   if(v[0]*gravity[0]+v[1]*gravity[1]!==0)return s;
   side=v;
  }
  if(!side)throw Error('Unknown action.');
  if(s.grounded||s.steered)return s;
  if(solid(s,add(s.position,side)))return contact(s,add(s.position,side));
  let next=enter({...s,steered:true,moves:s.moves+1,event:''},add(s.position,side));
  if(next.event==='spike'||next.dead||next.won)return next;
  if(next.rise===0){const grounded=supported(next);next={...next,grounded,bounceTicks:grounded?0:next.bounceTicks,lavaContact:grounded?false:next.lavaContact};}
  return next;
 }
 function tick(s,held=false){
  if(s.grounded||s.won||s.dead)return s;
  let next={...s,event:'',impact:null};
  if(next.bounceTicks>0)return {...next,bounceTicks:next.bounceTicks-1,lavaContact:next.bounceTicks>1};
  // Releasing closes the boost window; holding cannot restart ascent later.
  if(!held)next.extended=true;
  if(next.rise===0&&held&&!next.extended&&next.holdRemaining>0){
   next.rise=1;next.holdRemaining--;
   if(next.holdRemaining===0)next.extended=true;
  }
  if(next.rise===0)next.extended=true;
  const v=directions[next.gravity].map(n=>next.rise>0?-n:n);
  const p=add(next.position,v);
  if(solid(next,p)){
   next=contact(next,p);
   if(next.event==='spike'||next.event==='lava'||next.dead)return next;
   if(next.rise>0)return {...next,rise:0,extended:true};
   return {...next,grounded:true,bounceTicks:0,lavaContact:false};
  }
  const rising=next.rise>0;
  next=enter(next,p);
  if(next.event==='spike'||next.dead||next.won)return next;
  if(rising)next={...next,rise:next.rise-1};
  else {const grounded=supported(next);next={...next,grounded,lavaContact:grounded?false:next.lavaContact};}
  return next;
 }
 function legalActions(s){
  if(s.won||s.dead)return [];
  const candidates=s.grounded?[...Object.keys(directions),'jump']:['steer-left','steer-right'];
  return candidates.filter(a=>input(s,a)!==s);
 }
 function observe(s){return {...s,board:s.board.slice(),position:s.position.slice(),impact:s.impact?{...s.impact,position:s.impact.position.slice(),normal:s.impact.normal.slice()}:null,legalActions:legalActions(s)};}
 const api={create,input,tick,observe,legalActions};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GetOut=api;
})(globalThis);
