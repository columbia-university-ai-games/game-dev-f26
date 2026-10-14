(function () {
  'use strict';
  const $ = id => document.getElementById(id), game = GetOut, levels = GetOutLevels;
  const arrows = {up:'↑',right:'→',down:'↓',left:'←'};
  let levelIndex = 0, state, history = [], trace = [], hints = 0, editing = false, draft;
  let title = '', prompt = '', initialBoard, renderedBoard;
  for (const [i,level] of levels.entries()) {
    const option = document.createElement('option'); option.value = i;
    option.textContent = `${i+1}. ${level.name}`; $('levels').append(option);
  }
  const customOption=document.createElement('option');customOption.value='custom';customOption.textContent='Your puzzle';customOption.disabled=true;$('levels').append(customOption);
  function announce(message) { $('status').textContent = message; }
  function load(board, name, thought, index) {
    state=game.create(board);initialBoard=board.slice();history=[];trace=[];hints=0;
    title=name;prompt=thought;levelIndex=index;editing=false;
    customOption.disabled=index!==null;$('levels').value=index===null?'custom':String(index);
    renderBoard();refresh();announce('Choose a direction. The walls are your stopping points.');
  }
  function refresh() {
    if (!editing && renderedBoard !== state.board) renderBoard();
    $('level-number').textContent=editing?'PUZZLE WORKSHOP':levelIndex===null?'YOUR PUZZLE':`PUZZLE ${String(levelIndex+1).padStart(2,'0')} / ${String(levels.length).padStart(2,'0')}`;
    $('level-title').textContent=editing?'Design a way out':title;$('moves').textContent=state.moves;
    $('prompt').textContent=prompt;$('editor').hidden=!editing;$('edit').hidden=editing;
    $('undo').disabled=editing||history.length===0;$('reset').disabled=editing;
    $('hint').disabled=editing||state.won;$('next').hidden=editing||!state.won||levelIndex===null||levelIndex===levels.length-1;
    document.querySelectorAll('[data-move]').forEach(b=>b.disabled=editing||state.won);
    $('levels').disabled=editing;
    const player=$('board').querySelector('.player');
    if(player){player.style.setProperty('--x',state.position[1]);player.style.setProperty('--y',state.position[0]);}
    $('board').setAttribute('aria-label',editing?'Puzzle editor. Choose a paint tool, then select a square.':`Puzzle board, ${state.board.length} rows and ${state.board[0].length} columns. You are at row ${state.position[0]+1}, column ${state.position[1]+1}. Arrow keys move.`);
    const list=$('trace-list');list.replaceChildren();
    if(!trace.length){const li=document.createElement('li');li.textContent='No moves yet.';list.append(li);}
    for(const event of trace){const li=document.createElement('li');li.textContent=event.type==='move'?`${arrows[event.action]} ${event.action}: (${event.from[0]+1}, ${event.from[1]+1}) → (${event.to[0]+1}, ${event.to[1]+1})${event.blocked?' · blocked':''}${event.broken?.length?' · one-use wall crumbled':''}${event.won?' · escaped':''}`:event.type==='hint'?`Hint requested: ${event.message}`:'Undid the previous move.';list.append(li);}
  }
  function renderBoard() {
    const board=$('board'), rows=editing?draft:state.board;
    if (!editing) renderedBoard=state.board;
    board.replaceChildren();board.classList.toggle('editing',editing);
    board.style.setProperty('--rows',rows.length);board.style.setProperty('--cols',rows[0].length);
    for(let r=0;r<rows.length;r++)for(let c=0;c<rows[r].length;c++){
      const value=rows[r][c],cell=document.createElement(editing?'button':'span');
      cell.className=`cell ${value==='#'?'wall':value==='F'?'fragile-wall':value==='E'?'exit':''}`;
      const description=value==='#'?'wall':value==='F'?'one-use wall':value==='E'?'exit':value==='S'?'start':'floor';
      cell.setAttribute('aria-label',`Row ${r+1}, column ${c+1}: ${description}`);
      if(value==='F'){const crack=document.createElement('span');crack.className='crack';crack.textContent='ϟ';crack.setAttribute('aria-hidden','true');cell.append(crack);}
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
    if(!editing){const player=document.createElement('div');player.className='player';player.setAttribute('aria-hidden','true');const dot=document.createElement('span');dot.textContent='••';player.append(dot);board.append(player);}
  }
  function crumbleWalls(broken, previous) {
    const board=$('board');
    const moved=previous.position[0]!==state.position[0]||previous.position[1]!==state.position[1];
    for(const [r,c] of broken){
      const cell=board.children[r*state.board[0].length+c];
      cell.className='cell';
      cell.setAttribute('aria-label',`Row ${r+1}, column ${c+1}: floor`);
      cell.replaceChildren();
      const crumble=document.createElement('span');
      crumble.className=`wall-crumble${moved?' after-slide':''}`;
      crumble.setAttribute('aria-hidden','true');
      for(let i=0;i<4;i++){
        const shard=document.createElement('i');shard.className='wall-shard';
        shard.style.setProperty('--dx',i%2?'35%':'-35%');
        shard.style.setProperty('--dy',i<2?'-35%':'35%');
        shard.style.setProperty('--spin',i%2?'16deg':'-16deg');
        crumble.append(shard);
      }
      const crack=document.createElement('span');crack.className='crumble-crack';crack.textContent='ϟ';crumble.append(crack);
      cell.append(crumble);
      crumble.addEventListener('animationend',event=>{if(event.target.classList.contains('wall-shard'))crumble.remove();});
      // Also clean up when reduced motion suppresses animation events.
      setTimeout(()=>crumble.remove(),650);
    }
    // The player DOM stays in place so its existing slide transition continues.
    renderedBoard=state.board;
  }
  function move(action) {
    if(editing||state.won)return;
    $('board').querySelectorAll('.wall-crumble').forEach(effect=>effect.remove());
    const previous=state,next=game.step(state,action);
    const broken=[];previous.board.forEach((row,r)=>{for(let c=0;c<row.length;c++)if(row[c]==='F'&&next.board[r][c]==='.')broken.push([r,c]);});
    trace.push({type:'move',broken,action,from:previous.position.slice(),to:next.position.slice(),blocked:next===previous,won:next.won});
    if(next!==previous){history.push(previous);state=next;}
    if(broken.length)crumbleWalls(broken,previous);
    refresh();
    if(state.won)announce(`You got out in ${state.moves} moves${hints?`, with ${hints} hint${hints===1?'':'s'}`:''}. What made the route click?`);
    else if(broken.length)announce(`One-use wall crumbled. You stopped at row ${state.position[0]+1}, column ${state.position[1]+1}; that wall is now floor. Undo restores it.`);
    else if(next===previous)announce(`Blocked ${action}. Try another direction; your move count stays the same.`);
    else announce(`Slid ${action}. Row ${state.position[0]+1}, column ${state.position[1]+1}. Choose your next stopping point.`);
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
  $('undo').addEventListener('click',()=>{if(history.length){state=history.pop();trace.push({type:'undo'});refresh();announce('Move undone. Try another route.');}});
  $('reset').addEventListener('click',()=>load(initialBoard,title,prompt,levelIndex));
  $('hint').addEventListener('click',()=>{
    const path=game.solve(state);hints++;
    const message=path===null?'There is no route from here. Undo a move or reset.':`Try ${arrows[path[0]]} ${path[0]}.`;
    trace.push({type:'hint',message});refresh();announce(message);
  });
  function loadLevel(i){const level=levels[i];load(level.board,level.name,level.prompt,i);}
  $('next').addEventListener('click',()=>loadLevel(levelIndex+1));
  $('levels').addEventListener('change',e=>{if(e.target.value!=='custom')loadLevel(Number(e.target.value));});
  $('edit').addEventListener('click',()=>{editing=true;draft=initialBoard.map(row=>row.split(''));renderBoard();refresh();announce('Choose a tool and tap a square. Your current game is kept until you play the new board.');});
  $('cancel-edit').addEventListener('click',()=>{editing=false;renderBoard();refresh();announce('Back to your puzzle.');});
  $('blank').addEventListener('click',()=>{draft=Array.from({length:7},()=>Array(7).fill('.'));draft[0][0]='S';draft[6][6]='E';renderBoard();refresh();announce('A fresh 7 × 7 board. Add walls to make a route.');});
  function loadCustom(rows){
    const candidate=game.create(rows);
    if(game.solve(candidate)===null)throw new Error('This board has no route to the exit. Change a wall, start, or exit and try again.');
    load(rows,'Your puzzle','What will your partner discover?',null);
    announce('Your board has a route to the exit. Hand it to a partner.');
  }
  $('play-custom').addEventListener('click',()=>{try{loadCustom(draft.map(row=>row.join('')));}catch(e){announce(e.message);}});
  $('export').addEventListener('click',()=>{
    $('board-code').value=(editing?draft.map(row=>row.join('')):initialBoard).join('\n');
    $('board-code').focus();$('board-code').select();announce('Board code selected. Copy it and send it to your partner.');
  });
  $('import').addEventListener('click',()=>{try{loadCustom($('board-code').value.trim().split(/\r?\n/).map(row=>row.trim()));}catch(e){announce(e.message);}});
  $('download').addEventListener('click',()=>{
    const payload={format:'get-out-trace-v1',board:initialBoard,events:trace,moves:state.moves,hints,outcome:state.won?'escaped':'in_progress',position:state.position};
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
