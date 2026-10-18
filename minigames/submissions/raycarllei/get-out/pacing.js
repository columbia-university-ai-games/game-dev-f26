/* Optional support. Movement and winning remain owned by engine.js. */
(function (root) {
  'use strict';
  const game=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.GetOut;
  const arrows={up:'↑',right:'→',down:'↓',left:'←'};
  function hint(state, requestedTier) {
    const tier=Math.min(3,Math.max(1,Math.floor(Number(requestedTier)||1)));
    const result={tier,target:null,action:null,message:''};
    if(state.won)return {...result,message:'You have already reached the exit.'};
    const path=game.solve(state);
    if(path===null)return {...result,message:'No route remains from this position. Undo a move or use Reset to try again.'};
    if(tier===1)return {...result,message:'Think about where each slide ends. Which wall or edge could set up your next turn? Moving away from the exit can help.'};
    const target=game.step(state,path[0]).position.slice();
    if(tier===2)return {...result,target,message:`Look at the outlined stopping point: row ${target[0]+1}, column ${target[1]+1}. What could you do from there?`};
    return {...result,target,action:path[0],message:`Try ${arrows[path[0]]} ${path[0]}. You will stop at row ${target[0]+1}, column ${target[1]+1}.`};
  }
  function needsNudge(events) {
    let start=0;
    for(let i=events.length-1;i>=0;i--)if(events[i].type==='hint'||events[i].type==='undo'){start=i+1;break;}
    const moves=events.slice(start).filter(e=>e.type==='move').slice(-6);
    if(moves.length>=2&&moves.at(-1).blocked&&moves.at(-2).blocked)return true;
    const visits=new Map();
    for(const move of moves)if(!move.blocked){
      const key=move.to.join(',');visits.set(key,(visits.get(key)||0)+1);
      if(visits.get(key)>=3)return true;
    }
    return false;
  }
  const api={hint,needsNudge};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GetOutPacing=api;
})(globalThis);
