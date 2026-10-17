(function () {
  'use strict';
  const $ = id => document.getElementById(id), game = GetOut, levels = GetOutLevels;
  const arrows = {up:'↑',right:'→',down:'↓',left:'←'};
  let levelIndex = 0, state, history = [], trace = [], hints = 0, editing = false, draft;
  let title = '', prompt = '', initialBoard;
  let initialDifficulty, paused = false, lastPauseReason = '', lastTime = performance.now(), attemptStart = lastTime;
  function pauseReason() {
    if (document.hidden) return 'Tab hidden';
    if (editing) return 'Editing your board';
    if (paused) return 'Paused';
    if (document.querySelector('.workshop-guide[open], #exchange[open], .trace[open]')) return 'Reading workshop tools';
    return '';
  }
  function caughtMessage() { announce('Caught! The chaser reached you. Undo your last slide or reset to try again.'); }
  function syncClock() {
    const now = performance.now(), elapsed = now - lastTime;
    lastTime = now;
    if (!state || pauseReason()) return;
    const previous = state, next = game.advanceTime(state, elapsed);
    state = next;
    if (next.enemy.index !== previous.enemy.index || next.caught !== previous.caught) {
      trace.push({type:'chase',from:game.enemyPosition(previous),to:game.enemyPosition(next),
        caught:next.caught,atMs:Math.round(now-attemptStart)});
      refresh();
      if (state.caught) caughtMessage();
    }
  }
  for (const [i,level] of levels.entries()) {
    const option = document.createElement('option'); option.value = i;
    option.textContent = `${i+1}. ${level.name}`; $('levels').append(option);
  }
  const customOption=document.createElement('option');customOption.value='custom';customOption.textContent='Your puzzle';customOption.disabled=true;$('levels').append(customOption);
  function announce(message) { $('status').textContent = message; }
  function load(board, name, thought, index, difficulty = levels[0].difficulty) {
    state=game.create(board,difficulty);initialBoard=board.slice();initialDifficulty={...difficulty};history=[];trace=[];hints=0;
    paused=false;lastPauseReason='';lastTime=performance.now();attemptStart=lastTime;
    title=name;prompt=thought;levelIndex=index;editing=false;
    customOption.disabled=index!==null;$('levels').value=index===null?'custom':String(index);
    renderBoard();refresh();announce(`Choose a direction. The chaser spawns at your start after ${difficulty.spawnMoves} successful moves.`);
  }
  function refresh() {
    $('level-number').textContent=editing?'PUZZLE WORKSHOP':levelIndex===null?'YOUR PUZZLE':`PUZZLE ${String(levelIndex+1).padStart(2,'0')} / ${String(levels.length).padStart(2,'0')}`;
    $('level-title').textContent=editing?'Design a way out':title;$('moves').textContent=state.moves;
    $('prompt').textContent=prompt;$('editor').hidden=!editing;$('edit').hidden=editing;
    $('undo').disabled=editing||history.length===0;$('reset').disabled=editing;
    $('hint').disabled=editing||state.won||state.caught;$('next').hidden=editing||!state.won||levelIndex===null||levelIndex===levels.length-1;
    const reason=pauseReason();
    if(reason!==lastPauseReason){
      trace.push({type:'pause',automatic:(reason||lastPauseReason)!=='Paused',message:reason?`${reason} — chase frozen.`:'Resumed the chase.',atMs:Math.round(performance.now()-attemptStart)});
      lastPauseReason=reason;
    }
    $('pause').disabled=editing||state.won||state.caught;
    $('pause').textContent=paused?'▶ Resume':'Ⅱ Pause';$('pause').setAttribute('aria-pressed',String(paused));
    document.querySelectorAll('[data-move]').forEach(b=>b.disabled=!!reason||state.won||state.caught);
    $('levels').disabled=editing;
    const player=$('board').querySelector('.player');
    if(player){player.style.setProperty('--x',state.position[1]);player.style.setProperty('--y',state.position[0]);}
    const enemyPosition=game.enemyPosition(state),enemy=$('enemy');
    if(enemy){enemy.hidden=!state.enemy.active;if(enemyPosition){enemy.style.setProperty('--x',enemyPosition[1]);enemy.style.setProperty('--y',enemyPosition[0]);}}
    const pending=new Set(state.trail.slice(state.enemy.active?state.enemy.index+1:1).map(p=>p.join(',')));
    if(!editing)Array.from($('board').querySelectorAll('.cell')).forEach((cell,i)=>{
      const r=Math.floor(i/state.board[0].length),c=i%state.board[0].length;
      cell.classList.toggle('trail-cell',pending.has(`${r},${c}`)&&state.board[r][c]!== 'E');
    });
    $('board').classList.toggle('caught',state.caught);$('board').classList.toggle('paused',!!reason);
    const remaining=Math.max(0,state.difficulty.spawnMoves-state.moves);
    $('chase-settings').textContent=`${state.difficulty.spawnMoves}-move head start · ${state.difficulty.tilesPerSecond} tile${state.difficulty.tilesPerSecond===1?'':'s'} / second`;
    $('chase-status').textContent=state.won?'Escaped — chase stopped':state.caught?'Caught — undo or reset':reason?`${reason} — chase frozen`:state.enemy.active?`Chasing · ${state.trail.length-1-state.enemy.index} trail tiles behind`:`Spawns in ${remaining} successful move${remaining===1?'':'s'}`;
    $('chase-panel').classList.toggle('active-chase',state.enemy.active&&!state.won&&!state.caught&&!reason);
    $('board').setAttribute('aria-label',editing?'Puzzle editor. Choose a paint tool, then select a square.':`Puzzle board, ${state.board.length} rows and ${state.board[0].length} columns. You are at row ${state.position[0]+1}, column ${state.position[1]+1}. ${enemyPosition?`Chaser at row ${enemyPosition[0]+1}, column ${enemyPosition[1]+1}.`:state.won?'Chase stopped.':`Chaser spawns in ${remaining} successful move${remaining===1?'':'s'}.`} ${state.caught?'Caught.':state.won?'Escaped.':reason?'Paused.':'Arrow keys move.'}`);
    const list=$('trace-list');list.replaceChildren();
    if(!trace.length){const li=document.createElement('li');li.textContent='No moves yet.';list.append(li);}
    for(const event of trace){const li=document.createElement('li');li.textContent=event.type==='move'?`${arrows[event.action]} ${event.action}: (${event.from[0]+1}, ${event.from[1]+1}) → (${event.to[0]+1}, ${event.to[1]+1})${event.blocked?' · blocked':''}${event.won?' · escaped':''}${event.caught?' · caught':''}${event.spawned?' · chaser spawned':''}`:event.type==='hint'?`Hint requested: ${event.message}`:event.type==='chase'?`Chaser → (${event.to[0]+1}, ${event.to[1]+1})${event.caught?' · caught':''}`:event.type==='pause'?event.message:'Undid the previous slide and restored the chaser.';list.append(li);}
  }
  function renderBoard() {
    const board=$('board'), rows=editing?draft:state.board;
    board.replaceChildren();board.classList.toggle('editing',editing);
    board.style.setProperty('--rows',rows.length);board.style.setProperty('--cols',rows[0].length);
    for(let r=0;r<rows.length;r++)for(let c=0;c<rows[r].length;c++){
      const value=rows[r][c],cell=document.createElement(editing?'button':'span');
      cell.className=`cell ${value==='#'?'wall':value==='E'?'exit':''}`;
      const description=value==='#'?'wall':value==='E'?'exit':value==='S'?'start':'floor';
      cell.setAttribute('aria-label',`Row ${r+1}, column ${c+1}: ${description}`);
      if(value==='E'){const door=document.createElement('span');door.className='door';door.textContent='↗';door.setAttribute('aria-hidden','true');cell.append(door);}
      if(value==='S'){const mark=document.createElement('span');mark.className='start-mark';mark.textContent='×';mark.setAttribute('aria-hidden','true');cell.append(mark);}
      if(editing)cell.addEventListener('click',()=>{
        const tool=document.querySelector('input[name=tool]:checked').value;
        if(tool==='S'||tool==='E')draft=draft.map(row=>row.map(v=>v===tool?'.':v));
        draft[r][c]=tool;renderBoard();refresh();
        $('board').children[r*rows[0].length+c].focus({preventScroll:true});
        announce(`${description} changed. Choose Check & play when your board is ready.`);
      });
      board.append(cell);
    }
    if(!editing){
      const enemy=document.createElement('div');enemy.id='enemy';enemy.className='enemy';enemy.setAttribute('aria-hidden','true');const face=document.createElement('span');face.textContent='⌁';enemy.append(face);board.append(enemy);
      const player=document.createElement('div');player.className='player';player.setAttribute('aria-hidden','true');const dot=document.createElement('span');dot.textContent='••';player.append(dot);board.append(player);
    }
  }
  function move(action) {
    syncClock();
    if(pauseReason()||state.won||state.caught)return;
    const previous=state,next=game.step(state,action);
    trace.push({type:'move',action,from:previous.position.slice(),to:next.position.slice(),blocked:next===previous,won:next.won,
      caught:next.caught,spawned:!previous.enemy.active&&next.enemy.active,atMs:Math.round(performance.now()-attemptStart)});
    if(next!==previous){history.push(previous);state=next;}
    refresh();
    if(state.caught)caughtMessage();
    else if(state.won)announce(`You got out in ${state.moves} moves${hints?`, with ${hints} hint${hints===1?'':'s'}`:''}. The chase has stopped.`);
    else if(next===previous)announce(`Blocked ${action}. Try another direction; your move count stays the same.`);
    else announce(`Slid ${action}. ${!previous.enemy.active&&state.enemy.active?'The chaser spawned at your start! ':''}Row ${state.position[0]+1}, column ${state.position[1]+1}. ${state.enemy.active?'Keep moving — it follows your trail.':'Plan your next stopping point.'}`);
  }
  document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>move(b.dataset.move)));
  document.addEventListener('keydown',e=>{
    if(editing||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,summary,.workshop-guide'))return;
    const action={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left',w:'up',d:'right',s:'down',a:'left'}[e.key];
    if(action){e.preventDefault();move(action);}
  });
  let startTouch=null;
  $('board').addEventListener('pointerdown',e=>{if(!editing&&e.pointerType!=='mouse')startTouch={x:e.clientX,y:e.clientY};});
  $('board').addEventListener('pointerup',e=>{
    if(!startTouch)return;const dx=e.clientX-startTouch.x,dy=e.clientY-startTouch.y;startTouch=null;
    if(Math.max(Math.abs(dx),Math.abs(dy))>20)move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
  });
  $('board').addEventListener('pointercancel',()=>startTouch=null);
  $('undo').addEventListener('click',()=>{if(history.length){state=history.pop();lastTime=performance.now();trace.push({type:'undo',atMs:Math.round(lastTime-attemptStart)});refresh();announce('Slide undone. Your trail and chaser progress were restored.');}});
  $('reset').addEventListener('click',()=>load(initialBoard,title,prompt,levelIndex,initialDifficulty));
  $('pause').addEventListener('click',()=>{
    syncClock();if(state.won||state.caught)return;
    paused=!paused;lastTime=performance.now();refresh();
    announce(paused?'Paused. Both you and the chaser are frozen.':'Resumed. The chaser follows your recorded trail.');
  });
  $('hint').addEventListener('click',()=>{
    syncClock();if(state.won||state.caught)return;
    const path=game.solve(state);hints++;
    const timingNote=pauseReason()?'The enemy will move after you resume.':'The enemy may move while you decide.';
    const message=path===null?'No immediate safe route from these enemy positions. You can wait for it to move, undo, or reset.':`Route tip at these positions: ${arrows[path[0]]} ${path[0]}. ${timingNote}`;
    trace.push({type:'hint',message});refresh();announce(message);
  });
  function loadLevel(i){const level=levels[i];load(level.board,level.name,level.prompt,i,level.difficulty);}
  $('next').addEventListener('click',()=>loadLevel(levelIndex+1));
  $('levels').addEventListener('change',e=>{if(e.target.value!=='custom')loadLevel(Number(e.target.value));});
  $('edit').addEventListener('click',()=>{syncClock();editing=true;draft=initialBoard.map(row=>row.split(''));renderBoard();refresh();announce('The chase is paused. Choose a tool and tap a square. Your current game is kept until you play the new board.');});
  $('cancel-edit').addEventListener('click',()=>{editing=false;lastTime=performance.now();renderBoard();refresh();announce('Back to your puzzle.');});
  $('blank').addEventListener('click',()=>{draft=Array.from({length:7},()=>Array(7).fill('.'));draft[0][0]='S';draft[6][6]='E';renderBoard();refresh();announce('A fresh 7 × 7 board. Add walls to make a route.');});
  function loadCustom(rows){
    const candidate=game.create(rows,state.difficulty);
    if(game.solve(candidate)===null)throw new Error('This board has no immediate safe route with this chase setting. Change a wall, start, or exit, or try an earlier level before importing.');
    load(rows,'Your puzzle','Combine stopping points with staying ahead of your trace.',null,state.difficulty);
    announce('Your board has an immediate route to the exit. It keeps the current chase difficulty.');
  }
  $('play-custom').addEventListener('click',()=>{try{loadCustom(draft.map(row=>row.join('')));}catch(e){announce(e.message);}});
  $('export').addEventListener('click',()=>{
    $('board-code').value=(editing?draft.map(row=>row.join('')):initialBoard).join('\n');
    $('board-code').focus();$('board-code').select();announce('Board code selected. Copy it and send it to your partner.');
  });
  $('import').addEventListener('click',()=>{try{loadCustom($('board-code').value.trim().split(/\r?\n/).map(row=>row.trim()));}catch(e){announce(e.message);}});
  $('download').addEventListener('click',()=>{
    const payload={format:'get-out-trace-chaser-v1',board:initialBoard,difficulty:initialDifficulty,events:trace,moves:state.moves,hints,
      outcome:state.won?'escaped':state.caught?'caught':'in_progress',position:state.position,trail:state.trail,enemy:game.observe(state).enemy};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='get-out-trace.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.querySelectorAll('[data-guide]').forEach(button=>button.addEventListener('click',()=>{
    const guide=$(button.dataset.guide);
    guide.open=true;
    guide.querySelector('summary').focus({preventScroll:true});
    guide.scrollIntoView({block:'start'});
  }));
  document.querySelectorAll('.workshop-guide, #exchange, .trace').forEach(detail=>detail.addEventListener('toggle',()=>{
    lastTime=performance.now();refresh();
  }));
  document.addEventListener('visibilitychange',()=>{lastTime=performance.now();refresh();});
  loadLevel(0);
  setInterval(syncClock,50);
})();
