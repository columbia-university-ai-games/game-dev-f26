/* Run progression owns hearts across levels; physics owns individual contacts. */
(function(root){
 const game=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.GetOut;
 function create(levels){return {levels,index:0,state:game.create(levels[0].board),restarts:0,impact:null,message:''};}
 function apply(run,operation){
  const state=operation(run.state);
  if(state===run.state)return run;
  if(state.dead)return {...create(run.levels),restarts:run.restarts+1,impact:state.impact,message:'Out of hearts. Back to level 1 with five hearts.'};
  return {...run,state,impact:state.impact,message:state.event==='spike'?'Spike! One heart lost. Level reset.':state.event==='lava'?'Lava! One third of a heart lost.':run.message};
 }
 function input(run,action){return apply(run,s=>game.input(s,action));}
 function tick(run,held){return apply(run,s=>game.tick(s,held));}
 function next(run){
  if(!run.state.won||run.index===run.levels.length-1)return run;
  const index=run.index+1;
  return {...run,index,state:game.create(run.levels[index].board,run.state.health),impact:null,message:''};
 }
 function reset(run){return {...run,state:game.create(run.levels[run.index].board,run.state.health),impact:null,message:'Level reset. Hearts unchanged.'};}
 const api={create,input,tick,next,reset};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GravityCampaign=api;
})(globalThis);
