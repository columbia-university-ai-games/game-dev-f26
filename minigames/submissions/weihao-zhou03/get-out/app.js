(function () {
  'use strict';
  const $ = id => document.getElementById(id), game = GetOut, levels = GetOutLevels;
  const arrows = {up:'↑',right:'→',down:'↓',left:'←',wait:'Ⅱ'};
  const wallIds='ABC';
  const wallColors=[{fill:'#e6ac4b',edge:'#875414',ink:'#624115'},
    {fill:'#7dbbd0',edge:'#34718c',ink:'#244f64'},
    {fill:'#b6a1d7',edge:'#725293',ink:'#50386b'}];
  let levelIndex = 0, state, history = [], trace = [], hints = 0, editing = false, draft;
  let title = '', prompt = '', initialBoard, initialMovers = [], draftMovers = [], optimalTurns = null;
  let initialMonster=null,draftMonster=null;
  const copy = value => JSON.parse(JSON.stringify(value));
  const wallFrames = s => s.movers.map((m,i)=>({id:wallIds[i],position:m.path[m.index].slice(),direction:m.direction}));
  function wallArrow(m){
    let index=m.index+m.direction;
    if(index<0||index>=m.path.length)index=m.index-m.direction;
    const p=m.path[m.index],target=m.targetPosition||m.path[index];
    return target[0]<p[0]?'↑':target[0]>p[0]?'↓':target[1]<p[1]?'←':'→';
  }
  function styleWall(element,i){
    element.dataset.wall=i;
    for(const [name,value] of Object.entries(wallColors[i]))element.style.setProperty(`--mover-${name}`,value);
  }
  for(const mode of ['hunt','practice']){
    const group=document.createElement('optgroup');group.label=mode==='hunt'?'PURSUIT · hunter + gates':'PRACTICE · gates only';
    let number=0;
    for(const [i,level] of levels.entries())if(level.mode===mode){
      const option=document.createElement('option');option.value=i;option.textContent=`${++number}. ${level.name}`;group.append(option);
    }
    $('levels').append(group);
  }
  const customOption=document.createElement('option');customOption.value='custom';customOption.textContent='Your puzzle';customOption.disabled=true;$('levels').append(customOption);
  function announce(message) { $('status').textContent = message; }
  function load(board, name, thought, index, movers = [],monster=null) {
    state=game.create(board,{movers,monster});initialBoard=board.slice();initialMovers=copy(state.movers);initialMonster=copy(state.monster);history=[];trace=[];hints=0;
    const solution=game.solve(state);optimalTurns=solution===null?null:solution.length;
    title=name;prompt=thought;levelIndex=index;editing=false;
    customOption.disabled=index!==null;$('levels').value=index===null?'custom':String(index);
    renderBoard();refresh();announce(monster?'Reach the door alive. Slide, gates shift, then the hunter takes one step. H marks its next cell IF YOU WAIT.':movers.length?'Your turn, then every moving wall. Letters match each wall to its dashed next target.':'Choose a direction. The walls are your stopping points.');
  }
  function refresh() {
    const mode=levelIndex===null?null:levels[levelIndex].mode;
    const group=levels.filter(level=>level.mode===mode),groupIndex=levelIndex===null?-1:group.indexOf(levels[levelIndex]);
    $('level-number').textContent=editing?'PUZZLE WORKSHOP':levelIndex===null?'YOUR PUZZLE':`${mode==='hunt'?'PURSUIT':'PRACTICE'} ${String(groupIndex+1).padStart(2,'0')} / ${String(group.length).padStart(2,'0')}`;
    $('level-title').textContent=editing?'Design a way out':title;$('moves').textContent=state.moves;
    $('optimal').textContent=optimalTurns===null?'—':String(optimalTurns);
    $('optimal-target').hidden=editing||optimalTurns===null;
    $('optimal-target').setAttribute('aria-label',`Shortest escape from the start: ${optimalTurns} turns, including Wait.`);
    const shownRows=editing?draft:state.board,shownMovers=editing?draftMovers:state.movers;
    const shownMonster=editing?draftMonster:state.monster,terminal=state.won||state.lost;
    const shownCells=shownRows.map(row=>typeof row==='string'?row:row.join('')).join('');
    $('level-meta').textContent=`${shownRows.length} × ${shownRows[0].length} · ${shownCells.split('#').length-1} fixed · ${shownMovers.length} gates${shownMonster?' · 1 hunter':''}`;
    $('prompt').textContent=prompt;$('editor').hidden=!editing;$('edit').hidden=editing;
    $('undo').disabled=editing||history.length===0;$('reset').disabled=editing;
    $('hint').disabled=editing||terminal;$('next').hidden=editing||!state.won||levelIndex===null||!levels[levelIndex+1]||levels[levelIndex+1].mode!==mode;
    document.querySelectorAll('[data-move]').forEach(b=>b.disabled=editing||terminal);
    $('wait').disabled=editing||terminal||(!state.movers.length&&!state.monster);
    document.querySelectorAll('[data-wall-key]').forEach(el=>el.hidden=Number(el.dataset.wallKey)>=shownMovers.length);
    $('levels').disabled=editing;
    const observation=game.observe(state),wallsInfo=observation.movers;
    if(!editing)updateActors(observation);
    $('board').classList.toggle('caught',!editing&&state.lost);
    $('status').classList.toggle('caught-message',!editing&&state.lost);
    $('recovery').hidden=editing||!state.lost;
    document.querySelectorAll('[data-hunt-only]').forEach(el=>el.hidden=!shownMonster);
    $('mode-kicker').textContent=shownMonster?'MOVING WALLS · THE PURSUIT':'MOVING WALLS · PRACTICE';
    $('mode-lede').innerHTML=shownMonster?'Every move opens a gap.<br>Something follows you through it.':'One move. Every wall shifts.<br>Find a gap. Make a stopping point.';
    $('rule-description').textContent=shownMonster?'Slide until a wall or the edge stops you. Gates shift, then the hunter walks one cell toward you. Touching it kills you. Reach the door alive to escape.':'Slide until a wall or the edge stops you. After your slide or Wait, every marked wall moves one rail cell. Reach the door to escape.';
    $('turn-flow').classList.toggle('has-hunter',Boolean(shownMonster));
    $('turn-flow').hidden=editing||(!shownMovers.length&&!shownMonster);
    $('gate-phase').hidden=$('gate-phase-arrow').hidden=!shownMovers.length;
    $('hunter-phase').textContent=`${shownMovers.length?'03':'02'} · HUNTER STEPS`;
    document.querySelector('.challenge-note').hidden=editing;
    $('wall-status').hidden=editing||!wallsInfo.length;
    $('wall-status').textContent=terminal?'Turn ended. All gates are at rest.':wallsInfo.map((m,i)=>`${wallIds[i]} ${wallArrow(m)} target (${m.targetPosition[0]+1}, ${m.targetPosition[1]+1})${m.held?` · held by ${m.heldBy==='monster'?'hunter':'you'}`:''}`).join('\n');
    const hunter=observation.monster;
    $('monster-status').hidden=editing||!hunter||terminal;
    $('monster-status').classList.toggle('lethal',Boolean(hunter?.waitLethal));
    $('wait').classList.toggle('dangerous',!editing&&!terminal&&Boolean(hunter?.waitLethal));
    $('wait').setAttribute('aria-label',hunter?.waitLethal&&!terminal?'Wait — the hunter will catch you':'Wait');
    if(hunter){
      const stays=hunter.position[0]===hunter.waitPosition[0]&&hunter.position[1]===hunter.waitPosition[1];
      $('monster-status').textContent=hunter.waitLethal?'IF YOU WAIT · the hunter catches you. Move away or Undo.':stays?`IF YOU WAIT · H stays at (${hunter.position[0]+1}, ${hunter.position[1]+1}); its route is blocked. Moving may open a route.`:`IF YOU WAIT · H moves to (${hunter.waitPosition[0]+1}, ${hunter.waitPosition[1]+1}) after the gates. Moving changes its route.`;
    }
    const wallDescription=wallsInfo.map((m,i)=>` Moving wall ${wallIds[i]} at row ${m.path[m.index][0]+1}, column ${m.path[m.index][1]+1}. Next target row ${m.targetPosition[0]+1}, column ${m.targetPosition[1]+1}.`).join('');
    const hunterDescription=hunter?` Hunter at row ${hunter.position[0]+1}, column ${hunter.position[1]+1}.${terminal?'':` If you wait it ends at row ${hunter.waitPosition[0]+1}, column ${hunter.waitPosition[1]+1}.${hunter.waitLethal?' Waiting is lethal.':''}`}`:'';
    const controls=state.won?' Puzzle complete.':state.lost?' Caught. Undo or reset.':` Arrow keys move.${wallsInfo.length||hunter?' Space waits.':''}`;
    $('board').setAttribute('aria-label',editing?'Puzzle editor. Choose a paint tool, then select a square.':`Puzzle board, ${state.board.length} rows and ${state.board[0].length} columns. You are at row ${state.position[0]+1}, column ${state.position[1]+1}.${wallDescription}${hunterDescription}${controls}`);
    const list=$('trace-list');list.replaceChildren();
    if(!trace.length){const li=document.createElement('li');li.textContent='No moves yet.';list.append(li);}
    for(const event of trace){const li=document.createElement('li');li.textContent=event.type==='move'?`${arrows[event.action]} ${event.action}: (${event.from[0]+1}, ${event.from[1]+1}) → (${event.to[0]+1}, ${event.to[1]+1})${event.blocked?' · blocked, no turn spent':''}${event.won?' · escaped':''}${event.lost?' · CAUGHT':''}${event.monsterTo?` · H (${event.monsterTo[0]+1}, ${event.monsterTo[1]+1})`:''}${event.wallsTo?.length?` · ${event.wallsTo.map(m=>`${m.id} (${m.position[0]+1}, ${m.position[1]+1})`).join('; ')}`:''}`:event.type==='hint'?`Hint requested: ${event.message}`:'Undid the previous turn: player, hunter and all gates restored.';list.append(li);}
  }
  function place(element,position){element.style.setProperty('--x',position[1]);element.style.setProperty('--y',position[0]);}
  function updateActors(observation){
    const wallsInfo=observation.movers,terminal=state.won||state.lost;
    place($('board').querySelector('.player'),state.position);
    $('board').querySelector('.player span').textContent=state.lost?'×':'••';
    for(const [i,mover] of wallsInfo.entries()){
      const wall=$('board').querySelector(`.moving-wall[data-wall="${i}"]`);
      place(wall,mover.path[mover.index]);wall.querySelector('b').textContent=terminal?(state.won?'✓':'•'):wallArrow(mover);
      const ghost=$('board').querySelector(`.next-wall[data-wall="${i}"]`);place(ghost,mover.targetPosition);ghost.hidden=terminal;
    }
    if(observation.monster){
      place($('board').querySelector('.monster'),observation.monster.position);
      const ghost=$('board').querySelector('.monster-ghost');place(ghost,observation.monster.waitPosition);ghost.hidden=terminal;
      ghost.classList.toggle('lethal',observation.monster.waitLethal);
    }
  }
  function renderBoard() {
    const board=$('board'), rows=editing?draft:state.board;
    const movers=editing?draftMovers:state.movers;
    const monster=editing?draftMonster:state.monster;
    const railCells=new Map();
    movers.forEach((rail,i)=>rail.path.forEach(p=>railCells.set(p.join(','),{i,horizontal:rail.path[0][0]===rail.path[1][0]})));
    board.replaceChildren();board.classList.toggle('editing',editing);
    board.style.setProperty('--rows',rows.length);board.style.setProperty('--cols',rows[0].length);
    for(let r=0;r<rows.length;r++)for(let c=0;c<rows[r].length;c++){
      const value=rows[r][c],cell=document.createElement(editing?'button':'span');
      const rail=railCells.get(`${r},${c}`);
      cell.className=`cell ${value==='#'?'wall':value==='E'?'exit':''} ${rail?`rail ${rail.horizontal?'rail-horizontal':'rail-vertical'}`:''}`;
      if(rail)cell.style.setProperty('--rail-ink',wallColors[rail.i].edge);
      const description=value==='#'?'wall':value==='E'?'exit':value==='S'?'start':'floor';
      cell.setAttribute('aria-label',`Row ${r+1}, column ${c+1}: ${description}${rail?`, wall ${wallIds[rail.i]} ${rail.horizontal?'horizontal':'vertical'} rail`:''}`);
      if(value==='E'){const door=document.createElement('span');door.className='door';door.textContent='↗';door.setAttribute('aria-hidden','true');cell.append(door);}
      if(value==='S'){const mark=document.createElement('span');mark.className='start-mark';mark.textContent='×';mark.setAttribute('aria-hidden','true');cell.append(mark);}
      if(editing)cell.addEventListener('click',()=>{
        const tool=document.querySelector('input[name=tool]:checked').value;
        if(tool==='H'){
          if(draft[r][c]!=='.'||draftMovers.some(m=>m.path[m.index][0]===r&&m.path[m.index][1]===c)){
            announce('Place the hunter on empty floor, away from the start, exit and gate positions.');return;
          }
          draftMonster=[r,c];renderBoard();refresh();
          $('board').children[r*rows[0].length+c].focus({preventScroll:true});
          announce('Hunter moved. Check & play verifies a safe escape.');return;
        }
        if(draftMonster&&draftMonster[0]===r&&draftMonster[1]===c){
          if(tool!=='.'){announce('Move the hunter or use Clear on it first.');return;}
          draftMonster=null;
        }
        if(railCells.has(`${r},${c}`)&&(tool==='#'||tool==='E')){announce('Keep rail cells open. Put fixed walls and the exit beside the rail.');return;}
        if(tool==='S'||tool==='E')draft=draft.map(row=>row.map(v=>v===tool?'.':v));
        draft[r][c]=tool;renderBoard();refresh();
        $('board').children[r*rows[0].length+c].focus({preventScroll:true});
        announce(`${description} changed. Choose Check & play when your board is ready.`);
      });
      board.append(cell);
    }
    if(!editing){const player=document.createElement('div');player.className='player';player.setAttribute('aria-hidden','true');const dot=document.createElement('span');dot.textContent='••';player.append(dot);board.append(player);}
    for(const [i,rail] of movers.entries()){
      if(!editing){const ghost=document.createElement('div');ghost.className='next-wall';ghost.setAttribute('aria-hidden','true');styleWall(ghost,i);const mark=document.createElement('span');mark.textContent=wallIds[i];ghost.append(mark);board.append(ghost);}
      const wall=document.createElement('div');wall.className='moving-wall';wall.setAttribute('aria-hidden','true');styleWall(wall,i);
      const icon=document.createElement('span'),name=document.createElement('small'),arrow=document.createElement('b');name.textContent=wallIds[i];arrow.textContent=wallArrow(rail);icon.append(name,arrow);wall.append(icon);place(wall,rail.path[rail.index]);board.append(wall);
    }
    if(monster){
      if(!editing){const ghost=document.createElement('div');ghost.className='monster-ghost';ghost.setAttribute('aria-hidden','true');ghost.innerHTML='<span>H</span>';board.append(ghost);}
      const actor=document.createElement('div');actor.className='monster';actor.setAttribute('aria-hidden','true');actor.innerHTML='<span><small>H</small><b>••</b></span>';place(actor,monster);board.append(actor);
    }
  }
  function move(action) {
    if(editing||state.won||state.lost)return;
    const previous=state,next=game.step(state,action);
    trace.push({type:'move',action,from:previous.position.slice(),to:next.position.slice(),blocked:next===previous,won:next.won,
      wallsFrom:wallFrames(previous),wallsTo:wallFrames(next),monsterFrom:copy(previous.monster),monsterTo:copy(next.monster),lost:next.lost,deathCause:next.deathCause,turn:next.moves});
    if(next!==previous){history.push(previous);state=next;}
    refresh();
    if(state.won){
      const comparison=optimalTurns===null?'':state.moves===optimalTurns?` You matched the ${optimalTurns}-turn optimum!`:` Optimal: ${optimalTurns} turns (${state.moves-optimalTurns} fewer).`;
      announce(`You got out in ${state.moves} turns${hints?`, with ${hints} hint${hints===1?'':'s'}`:''}.${comparison}`);
    }
    else if(state.lost)announce(state.deathCause==='slide'?'CAUGHT · You slid into the hunter. Undo a turn to try a different route.':'CAUGHT · The hunter reached you after the gates moved. Undo a turn or reset.');
    else if(next===previous)announce(action==='wait'&&!state.movers.length&&!state.monster?'This static puzzle has no moving actor. Choose a direction.':`Blocked ${action}. No turn spent; gates and hunter stay put.`);
    else announce(`${action==='wait'?'You waited.':`Slid ${action}.`} ${state.movers.length?'Gates shifted. ':''}${state.monster?'The hunter took its step. ':''}You are at row ${state.position[0]+1}, column ${state.position[1]+1}.`);
  }
  document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>{move(b.dataset.move);$('board').focus({preventScroll:true});}));
  document.addEventListener('keydown',e=>{
    if(editing||e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,summary,.workshop-guide'))return;
    if(e.key===' '&&e.target.closest('button,a'))return;
    const action={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left',w:'up',d:'right',s:'down',a:'left',' ':'wait','.':'wait'}[e.key];
    if(action){e.preventDefault();move(action);}
  });
  let startTouch=null;
  $('board').addEventListener('pointerdown',e=>{if(!editing&&e.pointerType!=='mouse')startTouch={x:e.clientX,y:e.clientY};});
  $('board').addEventListener('pointerup',e=>{
    if(!startTouch)return;const dx=e.clientX-startTouch.x,dy=e.clientY-startTouch.y;startTouch=null;
    if(Math.max(Math.abs(dx),Math.abs(dy))>20)move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
  });
  $('board').addEventListener('pointercancel',()=>startTouch=null);
  $('undo').addEventListener('click',()=>{if(history.length){state=history.pop();trace.push({type:'undo',position:state.position.slice(),walls:wallFrames(state),monster:copy(state.monster)});refresh();announce('Turn undone. You, the hunter and every gate are restored.');$('board').focus({preventScroll:true});}});
  $('reset').addEventListener('click',()=>load(initialBoard,title,prompt,levelIndex,initialMovers,initialMonster));
  $('hint').addEventListener('click',()=>{
    const path=game.solve(state);hints++;
    const message=path===null?'There is no safe route from here. Undo a turn or reset.':path[0]==='wait'?'Try Ⅱ Wait one turn. The solver checked the gates and hunter.':`Try ${arrows[path[0]]} ${path[0]}.${state.monster?' This begins a safe escape route.':''}`;
    trace.push({type:'hint',message});refresh();announce(message);
  });
  function loadLevel(i){const level=levels[i];load(level.board,level.name,level.prompt,i,level.movers||[],level.monster||null);}
  $('next').addEventListener('click',()=>loadLevel(levelIndex+1));
  $('levels').addEventListener('change',e=>{if(e.target.value!=='custom')loadLevel(Number(e.target.value));});
  $('edit').addEventListener('click',()=>{editing=true;draft=initialBoard.map(row=>row.split(''));draftMovers=copy(initialMovers);draftMonster=copy(initialMonster);renderBoard();refresh();announce('Edit around the rails. Hunter places one enemy; Clear on it removes it. Check & play verifies a safe route. Cancel returns to your current turn.');});
  $('cancel-edit').addEventListener('click',()=>{editing=false;renderBoard();refresh();announce('Back to your puzzle.');});
  $('blank').addEventListener('click',()=>{draft=Array.from({length:7},()=>Array(7).fill('.'));draft[0][0]='S';draft[6][6]='E';draftMovers=[];draftMonster=null;renderBoard();refresh();announce('A fresh 7 × 7 board. Add walls and an optional hunter.');});
  function loadCustom(rows,movers=[],monster=null){
    const candidate=game.create(rows,{movers,monster});
    if(game.solve(candidate)===null)throw new Error('This board has no safe route to the exit. Change a wall, hunter, start, or exit and try again.');
    load(rows,'Your puzzle','What will your partner discover?',null,movers,monster);
    announce('Your board has a route to the exit. Hand it to a partner.');
  }
  $('play-custom').addEventListener('click',()=>{try{loadCustom(draft.map(row=>row.join('')),draftMovers,draftMonster);}catch(e){announce(e.message);}});
  $('export').addEventListener('click',()=>{
    $('board-code').value=GetOutCode.encode(editing?draft.map(row=>row.join('')):initialBoard,editing?draftMovers:initialMovers,editing?draftMonster:initialMonster);
    $('board-code').focus();$('board-code').select();announce('Board code selected. Copy it and send it to your partner.');
  });
  $('import').addEventListener('click',()=>{try{const puzzle=GetOutCode.decode($('board-code').value);loadCustom(puzzle.board,puzzle.movers,puzzle.monster);}catch(e){announce(e.message);}});
  $('download').addEventListener('click',()=>{
    const payload={format:initialMonster?'get-out-pursuit-trace-v1':'get-out-moving-walls-trace-v2',board:initialBoard,movers:initialMovers,monster:initialMonster,events:trace,turns:state.moves,optimalTurns,hints,outcome:state.won?'escaped':state.lost?'caught':'in_progress',deathCause:state.deathCause,position:state.position,finalMovers:state.movers,finalMonster:state.monster};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='get-out-moving-walls-trace.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.querySelectorAll('[data-guide]').forEach(button=>button.addEventListener('click',()=>{
    const guide=$(button.dataset.guide);
    guide.open=true;
    guide.querySelector('summary').focus({preventScroll:true});
    guide.scrollIntoView({block:'start'});
  }));
  loadLevel(levels.findIndex(level=>level.mode==='hunt'));
})();
