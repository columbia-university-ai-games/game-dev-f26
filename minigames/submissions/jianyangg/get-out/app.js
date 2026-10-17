/* Browser controls and presentation; all game state changes go through the engine. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id),game=GetOut,campaign=GravityCampaign;
 const arrows={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left',w:'up',d:'right',s:'down',a:'left',q:'steer-left',e:'steer-right'};
 const icons={down:'↓',left:'←',up:'↑',right:'→'};
 const boardView=new GravityBoard.BoardView($('board'));
 const stepMs=GravityBoard.STEP_MS;
 const airSteering=new GravityControls.AirSteering();
 const jumpHold=new GravityJump.JumpHold();
 $('spring-key').append(GravityBlocks.createBlockArt(document,'T').element);
 let run=campaign.create(GetOutLevels),lastTime=0,elapsed=0,pauseUntil=0,reactionPause=false,announced='';
 function holding(){return jumpHold.active;}
 function render(snap=false){
  const s=run.state;
  $('level-number').textContent=`LEVEL ${run.index+1} / ${run.levels.length}`;
  $('level-title').textContent=run.levels[run.index].name;
  boardView.render(s,{snap});
  const hearts=[];for(let h=0;h<5;h++){const heart=document.createElement('span');heart.className='heart';for(let t=0;t<3;t++){const third=document.createElement('i');third.className=`third${s.health>h*3+t?' full':''}`;heart.append(third);}hearts.push(heart);}
  $('hearts').replaceChildren(...hearts);$('hearts').setAttribute('aria-label',`${s.health} of 15 health thirds remaining`);
  const remainder=s.health%3;$('health-label').textContent=`${Math.floor(s.health/3)}${remainder?` ${remainder}/3`:''} hearts`;
  $('gravity').textContent=`Gravity ${icons[s.gravity]} ${s.gravity}`;
  $('flight').textContent=s.won?'Exit reached':s.grounded?'Grounded · direction unlocked':`Airborne · ${s.steered?'steer used':'one steer available'}`;
  $('moves').textContent=`${s.moves} actions`;
  const final=s.won&&run.index===run.levels.length-1;
  const status=s.won?(final?'All levels cleared. Your hearts survived the run.':'Exit reached. Your remaining hearts carry into the next level.'):run.message||run.levels[run.index].prompt;
  if(status!==announced){$('status').textContent=status;announced=status;}
  $('next').hidden=!s.won||final;
  $('jump').disabled=s.won||(!s.grounded&&!jumpHold.active);
  const hint=reactionPause?'Hit! Respawning…':GravityHints.controlHint(s);
  if($('control-hint').textContent!==hint)$('control-hint').textContent=hint;
  document.querySelectorAll('[data-action]').forEach(button=>{
   const local=button.dataset.action.startsWith('steer-');
   button.disabled=s.won||s.dead||(local?(!s.grounded&&s.steered):(s.grounded&&!game.legalActions(s).includes(button.dataset.action)));
  });
 }
 function update(next,snap=false){
  if(next===run)return;
  const impact=next.impact&&next.impact!==run.impact?next.impact:null;
  const freeze=Boolean(impact&&(impact.kind==='spike'||next.restarts!==run.restarts));
  if(impact){
   const time=performance.now();
   const duration=boardView.showImpact(impact,run.state,{time,freeze});
   if(freeze){pauseUntil=time+duration;reactionPause=true;jumpHold.clear();airSteering.clear();}
  }
  run=next;render(snap||freeze);
 }
 function act(action){if(performance.now()<pauseUntil)return;update(campaign.input(run,action));}
 document.querySelectorAll('[data-action]').forEach(button=>{
  button.addEventListener('pointerdown',event=>{
   if(event.button!==0)return;
   event.preventDefault();
   airSteering.press(`pointer:${event.pointerId}`,button.dataset.action);
   act(button.dataset.action);$('board').focus({preventScroll:true});
  });
  button.addEventListener('click',event=>{
   if(event.detail===0){act(button.dataset.action);$('board').focus({preventScroll:true});}
  });
 });
 document.addEventListener('keydown',event=>{
  if(event.target.closest('textarea,input,select')||event.metaKey||event.ctrlKey||event.altKey)return;
  const action=arrows[event.key]||arrows[event.key.toLowerCase()];
  if(event.code==='Space'){
   if(event.target.closest('summary')||(event.target.closest('button')&&event.target.id!=='jump'))return;
   event.preventDefault();if(!event.repeat){jumpHold.press('keyboard');act('jump');}
  }else if(action){event.preventDefault();if(!event.repeat){airSteering.press(event.code,action);act(action);}}
 });
 document.addEventListener('keyup',e=>{if(e.code==='Space')jumpHold.release('keyboard');airSteering.release(e.code);});
 const jump=$('jump');jump.addEventListener('pointerdown',e=>{e.preventDefault();jump.setPointerCapture(e.pointerId);jumpHold.press(`pointer:${e.pointerId}`);act('jump');});
 for(const event of ['pointerup','pointercancel'])window.addEventListener(event,e=>{jumpHold.release(`pointer:${e.pointerId}`);airSteering.release(`pointer:${e.pointerId}`);});
 jump.addEventListener('lostpointercapture',e=>{jumpHold.release(`pointer:${e.pointerId}`);});
 jump.addEventListener('click',e=>{if(e.detail===0)act('jump');});
 window.addEventListener('blur',()=>{jumpHold.clear();airSteering.clear();});
 document.addEventListener('visibilitychange',()=>{jumpHold.clear();airSteering.clear();elapsed=0;lastTime=0;});
 function replaceRun(next){boardView.clearReaction();reactionPause=false;pauseUntil=0;jumpHold.clear();airSteering.clear();elapsed=0;update(next,true);$('board').focus({preventScroll:true});}
 $('reset').addEventListener('click',()=>replaceRun(campaign.reset(run)));
 $('restart').addEventListener('click',()=>replaceRun(campaign.create(run.levels)));
 $('next').addEventListener('click',()=>replaceRun(campaign.next(run)));
 $('campaign').addEventListener('click',()=>replaceRun(campaign.create(GetOutLevels)));
 $('export').addEventListener('click',()=>{$('board-code').value=run.state.board.join('\n');$('board-message').textContent='Board code ready to copy.';});
 $('import').addEventListener('click',()=>{
  try{
   const board=$('board-code').value.trim().split(/\r?\n/);game.create(board);
   if(!GravitySolver.solve(board))throw Error('No damage-free route found within the search budget. Try a simpler board.');
   replaceRun(campaign.create([{name:'Exchanged board',prompt:'A new floor, a new route.',board}]));$('board-message').textContent='Damage-free route verified. Practice run started.';
  }catch(error){$('board-message').textContent=error.message;}
 });
 function frame(time){
  if(reactionPause&&time>=pauseUntil){reactionPause=false;render(true);}
  boardView.resumeMotion(time);
  if(!document.hidden){
   if(lastTime)elapsed+=Math.min(time-lastTime,stepMs);
   if(elapsed>=stepMs){elapsed%=stepMs;if(time>=pauseUntil&&!run.state.grounded&&!run.state.won)update(campaign.tick(run,holding()));}
  }
  if(!document.hidden&&time>=pauseUntil){
   const action=airSteering.action(run.state);
   if(action){
    const next=campaign.input(run,action),before=run.state,after=next.state;
    if(after.position.join()!==before.position.join()||after.health!==before.health||next.restarts!==run.restarts)update(next);
   }
  }
  lastTime=time;requestAnimationFrame(frame);
 }
 render(true);requestAnimationFrame(frame);
})();
