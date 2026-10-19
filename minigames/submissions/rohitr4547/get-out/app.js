(function () {
  'use strict';
  const $ = id => document.getElementById(id), game = GetOut, levels = GetOutLevels;
  const arrows = {up:'↑',right:'→',down:'↓',left:'←'};
  const deltas = {up:[-1,0],right:[0,1],down:[1,0],left:[0,-1]};
  let levelIndex = 0, state, history = [], trace = [], hints = 0, editing = false, draft;
  let title = '', prompt = '', initialBoard, swapTimer;
  for (const [i,level] of levels.entries()) {
    const option = document.createElement('option'); option.value = i;
    option.textContent = `${i+1}. ${level.name}`; $('levels').append(option);
  }
  const customOption=document.createElement('option');customOption.value='custom';customOption.textContent='Your puzzle';customOption.disabled=true;$('levels').append(customOption);
  function announce(message) { $('status').textContent = message; }
  const square=([r,c])=>`row ${r+1}, column ${c+1}`;
  // A random roadblock sequence that still leaves a way out, starting on a different square from `avoid`
  // when it can. The number of tries is bounded so a large board cannot freeze the page.
  function randomSeed(board, avoid) {
    let fallback=null;
    for(let i=0;i<4;i++){
      const seed=game.solvableSeed(board,Math.floor(Math.random()*2**31),6);
      if(seed===null)continue;
      if(!avoid||String(game.create(board,seed).block)!==String(avoid))return seed;
      fallback=fallback??seed;
    }
    return fallback;
  }
  // The seed fixes the roadblock's path for this puzzle, so Reset replays the same sequence.
  function load(board, name, thought, index, seed) {
    finishSwap();state=game.create(board,seed);initialBoard=board.slice();history=[];trace=[];hints=0;
    title=name;prompt=thought;levelIndex=index;editing=false;
    customOption.disabled=index!==null;$('levels').value=index===null?'custom':String(index);
    renderBoard();refresh();
    announce(`${state.block?`A no-entry roadblock closes ${square(state.block)}. After every move it jumps to block your new shortest way out. `:'No roadblock sequence leaves a way out on this board, so it plays without one. '}Choose a direction. Miss the door and you swap places with it.`);
  }
  function refresh(slideEnd, shownBlock) {
    $('level-number').textContent=editing?'PUZZLE WORKSHOP':levelIndex===null?'YOUR PUZZLE':`PUZZLE ${String(levelIndex+1).padStart(2,'0')} / ${String(levels.length).padStart(2,'0')}`;
    $('level-title').textContent=editing?'Design a way out':title;$('moves').textContent=state.moves;
    $('prompt').textContent=prompt;$('editor').hidden=!editing;$('edit').hidden=editing;
    $('undo').disabled=editing||history.length===0;$('reset').disabled=editing;
    $('hint').disabled=editing||state.won||!!slideEnd;$('reroll').hidden=editing||state.seed===null;$('next').hidden=editing||!state.won||levelIndex===null||levelIndex===levels.length-1;
    document.querySelectorAll('[data-move]').forEach(b=>b.disabled=editing||state.won);
    $('levels').disabled=editing;
    // Before a swap, show the ball where it stopped and the exit where it was; then trade places.
    const place=(token,[r,c])=>{if(token){token.style.setProperty('--x',c);token.style.setProperty('--y',r);}};
    place($('board').querySelector('.player'),slideEnd||state.position);
    place($('board').querySelector('.exit-token'),slideEnd?state.position:state.exit);
    // During a swap the roadblock that stopped the slide stays put; then it jumps with the swap.
    const block=slideEnd?shownBlock:state.block,sign=$('board').querySelector('.roadblock-token');
    if(sign){sign.hidden=!block;if(block)place(sign,block);}
    if(!editing)$('board').querySelectorAll('.cell').forEach((cell,i)=>{
      const r=Math.floor(i/state.board[0].length),c=i%state.board[0].length;
      const here=([br,bc]=[])=>br===r&&bc===c;
      cell.setAttribute('aria-label',`Row ${r+1}, column ${c+1}: ${here(state.exit)?'exit':here(state.block||undefined)?'no-entry roadblock':cell.dataset.description}`);
    });
    $('board').setAttribute('aria-label',editing?'Puzzle editor. Choose a paint tool, then select a square.':`Puzzle board, ${state.board.length} rows and ${state.board[0].length} columns. You are at row ${state.position[0]+1}, column ${state.position[1]+1}. The exit is at row ${state.exit[0]+1}, column ${state.exit[1]+1}.${state.block?` The roadblock is at ${square(state.block)}.`:''} Arrow keys move.`);
    const list=$('trace-list');list.replaceChildren();
    if(!trace.length){const li=document.createElement('li');li.textContent='No moves yet.';list.append(li);}
    for(const event of trace){const li=document.createElement('li');li.textContent=event.type==='move'?`${arrows[event.action]} ${event.action}: (${event.from[0]+1}, ${event.from[1]+1}) → (${(event.swapped?event.exit:event.to)[0]+1}, ${(event.swapped?event.exit:event.to)[1]+1})${event.blocked?' · blocked':''}${event.roadblock?' by roadblock':''}${event.swapped?` · swap: you (${event.to[0]+1}, ${event.to[1]+1}), exit (${event.exit[0]+1}, ${event.exit[1]+1})`:''}${event.block&&!event.blocked&&!event.won?` · roadblock → (${event.block[0]+1}, ${event.block[1]+1})`:''}${event.won?' · escaped':''}`:event.type==='hint'?`Hint requested: ${event.message}`:'Undid the previous move.';list.append(li);}
  }
  function renderBoard() {
    const board=$('board'), rows=editing?draft:state.board;
    board.replaceChildren();board.classList.toggle('editing',editing);
    board.style.setProperty('--rows',rows.length);board.style.setProperty('--cols',rows[0].length);
    for(let r=0;r<rows.length;r++)for(let c=0;c<rows[r].length;c++){
      const value=rows[r][c],cell=document.createElement(editing?'button':'span');
      cell.className=`cell ${value==='#'?'wall':editing&&value==='E'?'exit':''}`;
      const description=value==='#'?'wall':value==='E'&&editing?'exit':value==='S'?'start':'floor';
      cell.dataset.description=description;cell.setAttribute('aria-label',`Row ${r+1}, column ${c+1}: ${description}`);
      if(editing&&value==='E'){const door=document.createElement('span');door.className='door';door.textContent='↗';door.setAttribute('aria-hidden','true');cell.append(door);}
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
    if(!editing){const exit=document.createElement('div');exit.className='exit-token';exit.setAttribute('aria-hidden','true');const door=document.createElement('span');door.className='door';door.textContent='↗';exit.append(door);board.append(exit);}
    if(!editing){const block=document.createElement('div');block.className='roadblock-token';block.setAttribute('aria-hidden','true');const sign=document.createElement('span');sign.className='no-entry';block.append(sign);board.append(block);}
    if(!editing){const player=document.createElement('div');player.className='player';player.setAttribute('aria-hidden','true');const dot=document.createElement('span');dot.textContent='••';player.append(dot);board.append(player);}
  }
  function finishSwap(){clearTimeout(swapTimer);swapTimer=null;}
  function move(action) {
    // Input waits for the swap to finish, so every move starts from the position on screen.
    if(editing||state.won||swapTimer)return;
    const previous=state,next=game.step(state,action),swapped=next!==previous&&!next.won;
    // Was the slide (or the blocked attempt) stopped by the roadblock rather than a wall or the edge?
    const stop=next===previous?previous.position:next.exit,[dr,dc]=deltas[action];
    const roadblock=!next.won&&!!previous.block&&previous.block[0]===stop[0]+dr&&previous.block[1]===stop[1]+dc;
    trace.push({type:'move',action,from:previous.position.slice(),to:next.position.slice(),exit:next.exit.slice(),block:next.block&&next.block.slice(),swapped,blocked:next===previous,roadblock,won:next.won});
    if(next!==previous){history.push(previous);state=next;}
    if(swapped){refresh(state.exit,previous.block);swapTimer=setTimeout(()=>{swapTimer=null;refresh();},matchMedia('(prefers-reduced-motion: reduce)').matches?0:260);}
    else refresh();
    if(state.won)announce(`You got out in ${state.moves} moves${hints?`, with ${hints} hint${hints===1?'':'s'}`:''}. What made the route click?`);
    else if(next===previous)announce(`Blocked ${action}${roadblock?' by the roadblock':''}. Try another direction; your move count stays the same.`);
    else announce(`Slid ${action} and stopped at row ${state.exit[0]+1}, column ${state.exit[1]+1}. Swap! You are now at row ${state.position[0]+1}, column ${state.position[1]+1}; the exit waits where you stopped.${roadblock?' The roadblock stopped your slide.':''}${state.block?` The roadblock jumped to ${square(state.block)}.`:''}`);
  }
  document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>move(b.dataset.move)));
  document.addEventListener('keydown',e=>{
    if(editing||e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,summary,.workshop-guide'))return;
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
  $('undo').addEventListener('click',()=>{if(history.length){finishSwap();state=history.pop();trace.push({type:'undo'});refresh();announce('Move undone. Try another route.');}});
  $('reset').addEventListener('click',()=>load(initialBoard,title,prompt,levelIndex,state.seed));
  $('reroll').addEventListener('click',()=>{const first=game.create(initialBoard,state.seed).block;load(initialBoard,title,prompt,levelIndex,randomSeed(initialBoard,first));});
  $('hint').addEventListener('click',()=>{
    if(swapTimer)return;
    const {path,complete}=game.solveWithin(state,60000);hints++;
    const message=path?`Try ${arrows[path[0]]} ${path[0]}.`:complete?'There is no route from here. Undo a move or reset.':'No hint found quickly on this large board. Try a move, or undo.';
    trace.push({type:'hint',message});refresh();announce(message);
  });
  // Teaching boards use a fixed roadblock sequence, so every player sees the same puzzle.
  function loadLevel(i){const level=levels[i];load(level.board,level.name,level.prompt,i,game.solvableSeed(level.board,i+1));}
  $('next').addEventListener('click',()=>loadLevel(levelIndex+1));
  $('levels').addEventListener('change',e=>{if(e.target.value!=='custom')loadLevel(Number(e.target.value));});
  $('edit').addEventListener('click',()=>{editing=true;draft=initialBoard.map(row=>row.split(''));renderBoard();refresh();announce('Choose a tool and tap a square. Your current game is kept until you play the new board.');});
  $('cancel-edit').addEventListener('click',()=>{editing=false;renderBoard();refresh();announce('Back to your puzzle.');});
  $('blank').addEventListener('click',()=>{draft=Array.from({length:7},()=>Array(7).fill('.'));draft[0][0]='S';draft[6][6]='E';renderBoard();refresh();announce('A fresh 7 × 7 board. Add walls to make a route.');});
  function loadCustom(rows){
    const candidate=game.create(rows);
    if(game.solve(candidate)===null)throw new Error('This board has no route to the exit. Change a wall, start, or exit and try again.');
    load(rows,'Your puzzle','What will your partner discover?',null,randomSeed(rows,null));
    announce(`Your board has a route to the exit. ${$('status').textContent}`);
  }
  $('play-custom').addEventListener('click',()=>{try{loadCustom(draft.map(row=>row.join('')));}catch(e){announce(e.message);}});
  $('export').addEventListener('click',()=>{
    $('board-code').value=(editing?draft.map(row=>row.join('')):initialBoard).join('\n');
    $('board-code').focus();$('board-code').select();announce('Board code selected. Copy it and send it to your partner.');
  });
  $('import').addEventListener('click',()=>{try{loadCustom($('board-code').value.trim().split(/\r?\n/).map(row=>row.trim()));}catch(e){announce(e.message);}});
  $('download').addEventListener('click',()=>{
    const payload={format:'get-out-moving-roadblock-trace-v1',board:initialBoard,seed:state.seed,roadblock:state.block,events:trace,moves:state.moves,hints,outcome:state.won?'escaped':'in_progress',position:state.position,exit:state.exit};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='get-out-trace.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.querySelectorAll('[data-guide]').forEach(button=>button.addEventListener('click',()=>{
    const guide=$(button.dataset.guide);
    guide.open=true;
    guide.querySelector('summary').focus({preventScroll:true});
    guide.scrollIntoView({block:'start'});
  }));
  loadLevel(0);
})();
