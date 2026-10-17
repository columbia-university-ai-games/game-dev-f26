(function () {
  'use strict';
  const $ = id => document.getElementById(id), game = GetOut, levels = GetOutLevels;
  const arrows = {up:'↑',right:'→',down:'↓',left:'←'};
  let levelIndex = 0, state, history = [], trace = [], hints = 0, editing = false, draft;
  let title = '', prompt = '', initialBoard, paused = false, nextTick = 0;
  const wallInterval = 900;
  let wallViews = new Map();
  function resumeClock() { if (paused) nextTick = performance.now() + wallInterval; paused = false; }
  for (const [i,level] of levels.entries()) {
    const option = document.createElement('option'); option.value = i;
    option.textContent = `${i+1}. ${level.name}`; $('levels').append(option);
  }
  const customOption=document.createElement('option');customOption.value='custom';customOption.textContent='Your puzzle';customOption.disabled=true;$('levels').append(customOption);
  function announce(message) { $('status').textContent = message; }
  function load(board, name, thought, index) {
    paused=false;nextTick=performance.now()+wallInterval;state=game.create(board);initialBoard=board.slice();history=[];trace=[];hints=0;
    title=name;prompt=thought;levelIndex=index;editing=false;
    customOption.disabled=index!==null;$('levels').value=index===null?'custom':String(index);
    renderBoard();refresh();announce('Choose a direction. Bump orange walls to slide them. Dark walls stay fixed.');
  }
  function refresh() {
    $('level-number').textContent=editing?'PUZZLE WORKSHOP':levelIndex===null?'YOUR PUZZLE':`PUZZLE ${String(levelIndex+1).padStart(2,'0')} / ${String(levels.length).padStart(2,'0')}`;
    $('level-title').textContent=editing?'Design a way out':title;$('moves').textContent=state.moves;
    $('prompt').textContent=prompt;$('editor').hidden=!editing;$('edit').hidden=editing;
    $('undo').disabled=editing||history.length===0;$('reset').disabled=editing;
    $('hint').disabled=editing||state.won;$('next').hidden=editing||!state.won||levelIndex===null||levelIndex===levels.length-1;
    document.querySelectorAll('[data-move]').forEach(b=>b.disabled=editing||state.won);
    $('levels').disabled=editing;
    $('pause').disabled=editing||state.won;
    $('pause').textContent=paused?'Resume walls':'Pause walls';
    $('wait').disabled=editing||state.won||!state.motions.length;
    const player=$('board').querySelector('.player');
    if(player){player.style.setProperty('--x',state.position[1]);player.style.setProperty('--y',state.position[0]);}
    $('board').setAttribute('aria-label',editing?'Puzzle editor. Choose a paint tool, then select a square.':`Puzzle board, ${state.board.length} rows and ${state.board[0].length} columns. You are at row ${state.position[0]+1}, column ${state.position[1]+1}. Arrow keys move.`);
    const list=$('trace-list');list.replaceChildren();
    if(!trace.length){const li=document.createElement('li');li.textContent='No moves yet.';list.append(li);}
    for(const event of trace){const li=document.createElement('li');li.textContent=event.type==='move'?`${arrows[event.action]} ${event.action}: (${event.from[0]+1}, ${event.from[1]+1}) → (${event.to[0]+1}, ${event.to[1]+1})${event.blocked?' · blocked':''}${event.won?' · escaped':''}`:event.type==='hint'?`Hint requested: ${event.message}`:event.type==='tick'?'Walls advanced one beat.':'Undid the previous move.';list.append(li);}
  }
  function renderBoard(previous = null) {
    const board=$('board'), rows=editing?draft:state.board;
    const hadFocus=document.activeElement===board;
    const reuse = previous && !editing;
    if(!reuse){board.replaceChildren();wallViews=new Map();}
    board.classList.toggle('editing',editing);
    board.style.setProperty('--rows',rows.length);board.style.setProperty('--cols',rows[0].length);
    for(let r=0;r<rows.length;r++)for(let c=0;c<rows[r].length;c++){
      const value=rows[r][c],cell=reuse?board.children[r*rows[0].length+c]:document.createElement(editing?'button':'span');
      if(reuse)cell.replaceChildren();
      cell.className=`cell ${value==='M'&&editing?'wall sliding-wall':value==='#'?'wall':value==='E'?'exit':''}`;
      const heading=!editing&&state.motions.find(m=>m.r===r&&m.c===c);
      const description=value==='M'?`sliding wall${heading?', moving '+heading.direction:', stopped'}`:value==='#'?'wall':value==='E'?'exit':value==='S'?'start':'floor';
      cell.setAttribute('aria-label',`Row ${r+1}, column ${c+1}: ${description}`);
      if(value==='M'&&editing){cell.textContent='?';}
      if(value==='E'){const door=document.createElement('span');door.className='door';door.textContent='↗';door.setAttribute('aria-hidden','true');cell.append(door);}
      if(value==='S'){const mark=document.createElement('span');mark.className='start-mark';mark.textContent='×';mark.setAttribute('aria-hidden','true');cell.append(mark);}
      if(editing)cell.addEventListener('click',()=>{
        const tool=document.querySelector('input[name=tool]:checked').value;
        if(tool==='S'||tool==='E')draft=draft.map(row=>row.map(v=>v===tool?'.':v));
        draft[r][c]=tool;renderBoard();refresh();
        $('board').children[r*rows[0].length+c].focus({preventScroll:true});
        announce(`${description} changed. Choose Check & play when your board is ready.`);
      });
      if(!reuse)board.append(cell);
    }
    if(!editing&&!reuse){const player=document.createElement('div');player.className='player';player.setAttribute('aria-hidden','true');const dot=document.createElement('span');dot.textContent='••';player.append(dot);board.append(player);}
    if(!editing){
      const updated=new Map();
      for(let r=0;r<rows.length;r++)for(let c=0;c<rows[r].length;c++){
        if(rows[r][c]!=='M')continue;
        let key=`${r},${c}`, piece=wallViews.get(key);
        // A clock tick changes coordinates; carry the same element to its new cell.
        if(!piece&&previous){
          const motion=state.motions.find(m=>m.r===r&&m.c===c);
          if(motion){
            const [dr,dc]={up:[-1,0],right:[0,1],down:[1,0],left:[0,-1]}[motion.direction];
            piece=wallViews.get(`${r-dr},${c-dc}`);
          }
        }
        if(!piece){piece=document.createElement('div');piece.className='wall-piece sliding-wall';piece.setAttribute('aria-hidden','true');board.append(piece);}
        piece.style.setProperty('--x',c);piece.style.setProperty('--y',r);
        const heading=state.motions.find(m=>m.r===r&&m.c===c);
        piece.textContent=heading?arrows[heading.direction]:'?';
        updated.set(key,piece);
      }
      wallViews=updated;
    }
    if(hadFocus)board.focus({preventScroll:true});
  }
  function move(action) {
    if(editing||state.won)return;
    resumeClock();
    const previous=state,next=game.step(state,action);
    trace.push({type:'move',action,from:previous.position.slice(),to:next.position.slice(),blocked:next===previous,won:next.won,board:next.board.slice(),motions:next.motions.map(m=>({...m}))});
    if(next!==previous){history.push(previous);state=next;}
    renderBoard(previous);refresh();
    if(state.won)announce(`You got out in ${state.moves} moves${hints?`, with ${hints} hint${hints===1?'':'s'}`:''}. What made the route click?`);
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
  $('undo').addEventListener('click',()=>{if(history.length){state=history.pop();paused=true;trace.push({type:'undo'});renderBoard();refresh();announce('Move undone. Try another route.');}});
  $('reset').addEventListener('click',()=>load(initialBoard,title,prompt,levelIndex));
  function advanceWalls() {
    const previous=state;state=game.tick(state);
    if(state!==previous){
      trace.push({type:'tick',board:state.board.slice(),motions:state.motions.map(m=>({...m}))});
      renderBoard(previous);refresh();
    }
  }
  $('pause').addEventListener('click',()=>{
    if(paused)resumeClock();else paused=true;
    refresh();announce(paused?'Walls paused. Resume or choose a direction to continue.':'Walls moving. Intercept an orange wall to redirect it.');
  });
  $('wait').addEventListener('click',()=>{paused=true;advanceWalls();refresh();announce('Advanced one wall beat; paused. Choose a direction or resume.');});
  setInterval(()=>{
    if(!state||editing||paused||state.won||document.hidden)return;
    if(performance.now()>=nextTick){nextTick=performance.now()+wallInterval;advanceWalls();}
  },50);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){paused=true;refresh();}});
  $('hint').addEventListener('click',()=>{
    paused=true;hints++;
    let message;
    try {
      const path=game.solve(state);
      message=path===null?'There is no route from here. Undo a move or reset.':
        path[0]==='wait'?'Wait one beat using the Wait button.':`Try ${arrows[path[0]]} ${path[0]}.`;
    } catch(e){message=e.message;}
    trace.push({type:'hint',message});refresh();announce(message+' Walls paused while you consider it.');
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
    const payload={format:'get-out-sliding-walls-v2',wallIntervalMs:wallInterval,board:initialBoard,events:trace,moves:state.moves,hints,outcome:state.won?'escaped':'in_progress',position:state.position,motions:state.motions.map(m=>({...m}))};
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
