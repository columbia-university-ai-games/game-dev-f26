(function () {
  'use strict';
  const $ = id => document.getElementById(id), game = GetOut, levels = GetOutLevels;
  const arrows = {up:'↑',right:'→',down:'↓',left:'←'};
  const isExit = value => /^[1-9]$/.test(value);
  let levelIndex = 0, state, history = [], trace = [], hints = 0, editing = false, draft;
  let title = '', prompt = '', initialBoard;

  for (const [i,level] of levels.entries()) {
    const option = document.createElement('option'); option.value = i;
    option.textContent = `${i+1}. ${level.name}`; $('levels').append(option);
  }
  const customOption=document.createElement('option');
  customOption.value='custom';customOption.textContent='Your puzzle';customOption.disabled=true;
  $('levels').append(customOption);
  function announce(message) { $('status').textContent = message; }

  function load(board, name, thought, index) {
    state=game.create(board);initialBoard=board.slice();history=[];trace=[];hints=0;
    title=name;prompt=thought;levelIndex=index;editing=false;
    customOption.disabled=index!==null;$('levels').value=index===null?'custom':String(index);
    renderBoard();refresh();announce('Reach exit 1 first. Each numbered exit stops your slide.');
  }

  function refresh() {
    $('level-number').textContent=editing?'PUZZLE WORKSHOP':levelIndex===null?'YOUR PUZZLE':`PUZZLE ${String(levelIndex+1).padStart(2,'0')} / ${String(levels.length).padStart(2,'0')}`;
    $('level-title').textContent=editing?'Design a sequence':title;
    $('moves').textContent=state.moves;
    $('next-exit').textContent=state.won?'✓':state.lost?'×':state.nextNumber;
    $('prompt').textContent=prompt;$('editor').hidden=!editing;$('edit').hidden=editing;
    $('undo').disabled=editing||history.length===0;$('reset').disabled=editing;
    $('hint').disabled=editing||state.won||state.lost;
    $('next').hidden=editing||!state.won||levelIndex===null||levelIndex===levels.length-1;
    document.querySelectorAll('[data-move]').forEach(button=>button.disabled=editing||state.won||state.lost);
    $('levels').disabled=editing;
    const player=$('board').querySelector('.player');
    if(player){player.style.setProperty('--x',state.position[1]);player.style.setProperty('--y',state.position[0]);}
    $('board').setAttribute('aria-label',editing?'Puzzle editor. Choose a paint tool, then select a square.':`Puzzle board, ${state.board.length} rows and ${state.board[0].length} columns. You are at row ${state.position[0]+1}, column ${state.position[1]+1}. Exit ${state.nextNumber} is next.`);
    const list=$('trace-list');list.replaceChildren();
    if(!trace.length){const li=document.createElement('li');li.textContent='No moves yet.';list.append(li);}
    for(const event of trace){
      const li=document.createElement('li');
      li.textContent=event.type==='move'
        ?`${arrows[event.action]} ${event.action}: (${event.from[0]+1}, ${event.from[1]+1}) → (${event.to[0]+1}, ${event.to[1]+1})${event.blocked?' · blocked':''}${event.hit?` · touched ${event.hit}`:''}${event.lost?' · out of order':''}${event.won?' · sequence complete':''}`
        :event.type==='hint'?`Hint requested: ${event.message}`:'Undid the previous move.';
      list.append(li);
    }
  }

  function renderBoard() {
    const board=$('board'), rows=editing?draft:state.board;
    board.replaceChildren();board.classList.toggle('editing',editing);
    board.style.setProperty('--rows',rows.length);board.style.setProperty('--cols',rows[0].length);
    for(let r=0;r<rows.length;r++)for(let c=0;c<rows[r].length;c++){
      const value=rows[r][c],cell=document.createElement(editing?'button':'span');
      cell.className=`cell ${value==='#'?'wall':isExit(value)?'numbered-exit':''}`;
      const description=value==='#'?'wall':isExit(value)?`numbered exit ${value}`:value==='S'?'start':'floor';
      cell.setAttribute('aria-label',`Row ${r+1}, column ${c+1}: ${description}`);
      if(isExit(value)){const number=document.createElement('span');number.className='exit-number';number.textContent=value;number.setAttribute('aria-hidden','true');cell.append(number);}
      if(value==='S'){const mark=document.createElement('span');mark.className='start-mark';mark.textContent='×';mark.setAttribute('aria-hidden','true');cell.append(mark);}
      if(editing)cell.addEventListener('click',()=>{
        const tool=document.querySelector('input[name=tool]:checked').value;
        if(tool==='S'||isExit(tool))draft=draft.map(row=>row.map(value=>value===tool?'.':value));
        draft[r][c]=tool;renderBoard();refresh();
        $('board').children[r*rows[0].length+c].focus({preventScroll:true});
        announce(`${description} changed. Choose Check & play when your sequence board is ready.`);
      });
      board.append(cell);
    }
    if(!editing){const player=document.createElement('div');player.className='player';player.setAttribute('aria-hidden','true');const dot=document.createElement('span');dot.textContent='••';player.append(dot);board.append(player);}
  }

  function move(action) {
    if(editing||state.won||state.lost)return;
    const previous=state,next=game.step(state,action);
    trace.push({type:'move',action,from:previous.position.slice(),to:next.position.slice(),
      blocked:next===previous,hit:next===previous?null:next.lastHit||null,won:next.won,lost:next.lost});
    if(next!==previous){history.push(previous);state=next;}
    refresh();
    if(state.lost)announce(`Out of order: you hit exit ${state.lastHit} while ${state.nextNumber} was next. Undo or reset.`);
    else if(state.won)announce(`You hit every exit in order in ${state.moves} moves${hints?`, with ${hints} hint${hints===1?'':'s'}`:''}. You got out!`);
    else if(next===previous)announce(`Blocked ${action}. Try another direction; your move count stays the same.`);
    else if(next.lastHit)announce(`You hit exit ${next.lastHit}. Now reach exit ${next.nextNumber}.`);
    else announce(`Slid ${action}. Row ${state.position[0]+1}, column ${state.position[1]+1}. Exit ${state.nextNumber} is next.`);
  }

  document.querySelectorAll('[data-move]').forEach(button=>button.addEventListener('click',()=>move(button.dataset.move)));
  document.addEventListener('keydown',event=>{
    if(editing||event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,textarea,select,summary,.workshop-guide'))return;
    const action={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left',w:'up',d:'right',s:'down',a:'left'}[event.key];
    if(action){event.preventDefault();move(action);}
  });
  let startTouch=null;
  $('board').addEventListener('pointerdown',event=>{if(!editing&&event.pointerType!=='mouse')startTouch={x:event.clientX,y:event.clientY};});
  $('board').addEventListener('pointerup',event=>{
    if(!startTouch)return;const dx=event.clientX-startTouch.x,dy=event.clientY-startTouch.y;startTouch=null;
    if(Math.max(Math.abs(dx),Math.abs(dy))>20)move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
  });
  $('board').addEventListener('pointercancel',()=>startTouch=null);
  $('undo').addEventListener('click',()=>{if(history.length){state=history.pop();trace.push({type:'undo'});refresh();announce('Move undone. Try another route.');}});
  $('reset').addEventListener('click',()=>load(initialBoard,title,prompt,levelIndex));
  $('hint').addEventListener('click',()=>{
    const path=game.solve(state);hints++;
    const message=path===null?'There is no complete sequence from here. Undo a move or reset.':`Try ${arrows[path[0]]} ${path[0]}.`;
    trace.push({type:'hint',message});refresh();announce(message);
  });
  function loadLevel(index){const level=levels[index];load(level.board,level.name,level.prompt,index);}
  $('next').addEventListener('click',()=>loadLevel(levelIndex+1));
  $('levels').addEventListener('change',event=>{if(event.target.value!=='custom')loadLevel(Number(event.target.value));});
  $('edit').addEventListener('click',()=>{editing=true;draft=initialBoard.map(row=>row.split(''));renderBoard();refresh();announce('Choose a wall, start, or numbered exit, then tap a square.');});
  $('cancel-edit').addEventListener('click',()=>{editing=false;renderBoard();refresh();announce('Back to your puzzle.');});
  $('blank').addEventListener('click',()=>{
    draft=Array.from({length:7},()=>Array(7).fill('.'));
    draft[0][0]='S';draft[0][6]='1';draft[6][6]='2';draft[6][0]='3';draft[3][0]='4';
    renderBoard();refresh();announce('A fresh 7 × 7 sequence board with exits 1 through 4.');
  });
  function loadCustom(rows){
    const candidate=game.create(rows);
    if(game.solve(candidate)===null)throw new Error('This board has no route through every exit in order. Change a wall, start, or exit and try again.');
    load(rows,'Your sequence','What route will your partner discover?',null);
    announce('Your board has a route through every exit in order. Hand it to a partner.');
  }
  $('play-custom').addEventListener('click',()=>{try{loadCustom(draft.map(row=>row.join('')));}catch(error){announce(error.message);}});
  $('export').addEventListener('click',()=>{
    $('board-code').value=(editing?draft.map(row=>row.join('')):initialBoard).join('\n');
    $('board-code').focus();$('board-code').select();announce('Board code selected. Copy it and send it to your partner.');
  });
  $('import').addEventListener('click',()=>{try{loadCustom($('board-code').value.trim().split(/\r?\n/).map(row=>row.trim()));}catch(error){announce(error.message);}});
  $('download').addEventListener('click',()=>{
    const payload={format:'get-out-trace-v2',board:initialBoard,events:trace,moves:state.moves,hints,
      nextNumber:state.nextNumber,outcome:state.lost?'out_of_order':state.won?'completed':'in_progress',position:state.position};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='get-out-trace.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.querySelectorAll('[data-guide]').forEach(button=>button.addEventListener('click',()=>{
    const guide=$(button.dataset.guide);guide.open=true;
    guide.querySelector('summary').focus({preventScroll:true});guide.scrollIntoView({block:'start'});
  }));
  loadLevel(0);
})();
