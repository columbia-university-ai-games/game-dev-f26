(function(){
 'use strict';
 const $=id=>document.getElementById(id),S=MisdeliveredStamp,core=GetOut,levels=GetOutLevels;
 const names={stop:'Stop',turn:'Turn',detour:'Detour'},icons={stop:'⚓',turn:'↱',detour:'↝'};
 const examples=[
  [{position:[1,0],label:'turn'},{position:[1,4],label:'stop'}],
  [{position:[6,1],label:'detour'},{position:[6,4],label:'turn'}]
 ];
 let session,title='',prompt='',levelIndex=0,editing=false,draft=[],draftStamps=[],selected=null;
 const clone=marks=>marks.map(mark=>({position:mark.position.slice(),label:mark.label}));
 const coord=p=>`row ${p[0]+1}, column ${p[1]+1}`;
 const describe=label=>`${icons[label]} ${names[label]}`;
 for(const [i,level] of levels.entries()){
  const option=document.createElement('option');option.value=i;option.textContent=`${i+1}. ${level.name}${i<2?' · two stamps':''}`;$('levels').append(option);
 }
 const custom=document.createElement('option');custom.value='custom';custom.textContent='Exchanged / custom board';custom.disabled=true;$('levels').append(custom);
 function announce(text){$('status').textContent=text;}
 function load(board,name,thought,index,stamps=[]){
  const next=S.create(board,stamps);session=next;title=name;prompt=thought;levelIndex=index;editing=false;selected=null;
  custom.disabled=index!==null;$('levels').value=index===null?'custom':String(index);render();
  announce('Reach the exit. Stamps are optional. An unmatched guess changes your position to a previewed past stop.');
 }
 function action(fn,message){
  try{session=fn(session);render();if(message)announce(typeof message==='function'?message():message);}catch(error){announce(error.message);}
 }
 function render(){
  $('level-title').textContent=editing?'Choose a stop. Choose an intention.':title;
  $('level-number').textContent=editing?'AUTHOR DESK':levelIndex===null?'EXCHANGED BOARD':`PUZZLE ${levelIndex+1} / ${levels.length}`;
  $('moves').textContent=session.moves;$('prompt').textContent=prompt;$('editor').hidden=!editing;$('edit').hidden=editing;
  const locked=Boolean(session.pending);
  $('undo').disabled=editing||locked||!session.undoStack.length;$('reset').disabled=editing||locked;
  $('hint').disabled=editing||locked||session.won;$('edit').disabled=locked;
  $('levels').disabled=editing||locked;$('import').disabled=locked;
  $('next').hidden=editing||!session.won||levelIndex===null||levelIndex===levels.length-1;
  document.querySelectorAll('[data-move]').forEach(button=>button.disabled=editing||locked||session.won);
  $('album').hidden=editing;$('stamp-interaction').hidden=editing;
  drawBoard();if(editing)renderAuthor();else{renderInteraction();renderAlbum();}renderTrace();
 }
 function geometry(){
  if(!editing&&(!session.arrival||!session.stamps.some(stamp=>S.key(stamp.position)===S.key(session.position))))return {contacts:[],exitLines:[]};
  try{return S.geometry(editing?draft.map(row=>row.join('')):session.board,editing?(selected??[-1,-1]):session.position,editing?null:session.arrival);}catch{return {contacts:[],exitLines:[]};}
 }
 function drawBoard(){
  const board=$('board'),rows=editing?draft:session.board,marks=editing?draftStamps:session.stamps,g=(editing&&!selected)?{contacts:[],exitLines:[]}:geometry();
  board.replaceChildren();board.classList.toggle('editing',editing);board.style.setProperty('--rows',rows.length);board.style.setProperty('--cols',rows[0].length);
  const pool=session.pending?.phase==='preview'?session.pending.candidates:[];
  for(let r=0;r<rows.length;r++)for(let c=0;c<rows[r].length;c++){
   const value=rows[r][c],id=`${r},${c}`,cell=document.createElement(editing?'button':'span'),mark=marks.find(t=>S.key(t.position)===id);
   cell.className=`cell ${value==='#'?'wall':value==='E'?'exit':''}`;cell.dataset.cell=id;
   let description=`Row ${r+1}, column ${c+1}: ${value==='#'?'wall':value==='E'?'exit':value==='S'?'start':'floor'}`;
   if(value==='E'){const door=document.createElement('span');door.className='door';door.textContent='↗';door.setAttribute('aria-hidden','true');cell.append(door);}
   if(value==='S'){const x=document.createElement('span');x.className='start-mark';x.textContent='×';x.setAttribute('aria-hidden','true');cell.append(x);}
   if(g.exitLines.some(p=>S.key(p)===id))cell.classList.add('exit-line');
   for(const contact of g.contacts){
    if(S.key(contact.boundary?contact.position:contact.blocker)===id)cell.classList.add('contact-'+contact.side);
   }
   if(mark){
    const result=!editing&&session.results[id],badge=document.createElement('span');badge.className='stamp-badge';
    badge.textContent=editing?icons[mark.label]:result?icons[result.author]:'?';badge.setAttribute('aria-hidden','true');cell.append(badge);
    cell.dataset.stamp=id;if(result)cell.classList.add(result.match?'stamp-matched':'stamp-unmatched');
    description+=editing?` · author stamp ${names[mark.label]}`:result?` · judged, author ${names[result.author]}, player ${names[result.guess]}`:' · optional sealed stamp';
   }
   const candidate=pool.findIndex(p=>S.key(p)===id);
   if(candidate>=0){cell.classList.add('delivery-candidate');const number=document.createElement('b');number.className='candidate-number';number.textContent=String(candidate+1);cell.append(number);description+=' · possible delivery position';}
   if(editing&&selected&&S.key(selected)===id)cell.classList.add('selected-marker');
   cell.setAttribute('aria-label',description);
   if(editing)cell.addEventListener('click',()=>paint(r,c));board.append(cell);
  }
  if(!editing){
   const player=document.createElement('div');player.className='player';player.setAttribute('aria-hidden','true');
   player.style.setProperty('--x',session.position[1]);player.style.setProperty('--y',session.position[0]);const dot=document.createElement('span');dot.textContent='••';player.append(dot);board.append(player);
  }
  board.setAttribute('aria-label',editing?'Author editor. Choose a tool and a square.':`Puzzle board. Player at ${coord(session.position)}. Arrow keys move.`);
 }
 function makeButton(text,handler,primary=false){const button=document.createElement('button');button.type='button';button.className=primary?'primary':'secondary';button.textContent=text;button.addEventListener('click',handler);return button;}
 function renderInteraction(){
  const panel=$('stamp-interaction');panel.replaceChildren();
  const heading=document.createElement('h3'),body=document.createElement('p');
  if(session.pending?.phase==='preview'){
   heading.textContent='Not the author’s choice. Preview the position change.';
   const judgment=session.results[session.pending.stamp];body.textContent=`Author: ${names[judgment.author]} / You: ${names[judgment.guess]}. Your judgment is recorded. Each highlighted position has a 1/${session.pending.candidates.length} chance. Moves stay unchanged.`;
   const list=document.createElement('ol');for(const p of session.pending.candidates){const li=document.createElement('li');li.textContent=coord(p);list.append(li);}
   const confirm=makeButton('Confirm position change',()=>action(s=>S.deliver(s),()=>`Position changed to ${coord(session.position)}. Undo reverses the position change; your judgment stays recorded.`),true);
   confirm.id='confirm-delivery';panel.append(heading,body,list,confirm);return;
  }
  if(session.pending?.phase==='choice'){
   heading.textContent='Which label did the author choose?';body.textContent='This is a match with the author, not a right/wrong test of understanding. An unmatched choice previews a change of position.';
   const choices=document.createElement('div');choices.className='stamp-choices';
   for(const label of S.labels){const button=makeButton(describe(label),()=>action(s=>S.guess(s,label),()=>session.pending?'Not the author’s choice. Inspect the highlighted candidates, then confirm.':'Matched the author’s choice. The stamp is in your album.'),true);button.dataset.guess=label;choices.append(button);}
   panel.append(heading,body,choices,makeButton('Continue without judging',()=>action(S.skip,'Stamp left undecided. Return by a normal slide to open it later.')));return;
  }
  if(session.eligible){
   heading.textContent='You stopped on a sealed stamp.';body.textContent='Open it to match the author’s intention, or keep moving. An unmatched guess changes your position to one of the previewed recent stops. Stamps are never required to escape.';
   const open=makeButton('Open stamp',()=>action(S.open,'Choose Stop, Turn, or Detour, or continue without judging.'),true);open.id='open-stamp';
   const skip=makeButton('Keep moving',()=>action(S.skip,'Stamp left undecided. You can open it on a later normal visit.'));skip.id='skip-stamp';panel.append(heading,body,open,skip);return;
  }
  panel.hidden=true;
 }
 function rate(bucket){return bucket.attempts?`${bucket.matches}/${bucket.attempts} (${Math.round(100*bucket.matches/bucket.attempts)}%)`:'— (no judgments)';}
 function appendStats(container,statistics,resetCount,round){
  const p=document.createElement('p');p.className='small';p.textContent=`First judgments: ${rate(statistics.first)} · Retry judgments: ${rate(statistics.retry)} · Resets: ${resetCount} · Round: ${round}`;container.append(p);
 }
 function renderAlbum(){
  const stats=S.stats(session);$('album-count').textContent=`Matched ${stats.round.matches} · Judged ${stats.round.judged} · Total ${stats.round.total}`;
  $('session-stats').replaceChildren();appendStats($('session-stats'),stats,session.resetCount,session.round);
  $('round-losses').textContent=`Position changes this round: ${session.misdeliveries} · Hints: ${session.hints}`;
  const album=$('album-list');album.replaceChildren();
  session.stamps.forEach((stamp,index)=>{
   const id=S.key(stamp.position),result=session.results[id],article=document.createElement('article');article.className='album-card';article.dataset.stamp=id;
   const h=document.createElement('h4');h.textContent=`Stamp ${index+1} · ${coord(stamp.position)}`;const p=document.createElement('p');
   if(result){article.classList.add(result.match?'matched':'unmatched');p.textContent=`${result.match?'Matched':'Not matched'} · Author: ${describe(result.author)} / You: ${describe(result.guess)} · ${result.first?'first judgment':'retry after Reset'}`;}
   else p.textContent='Undecided. Opening and judging are optional.';
   article.append(h,p);album.append(article);
  });
  if(!session.stamps.length){const p=document.createElement('p');p.textContent='No stamps on this board. Play normally or add up to two in the author editor.';album.append(p);}
 }
 function renderTrace(){
  const list=$('trace-list');list.replaceChildren();
  if(!session.events.length){const li=document.createElement('li');li.textContent='No actions yet.';list.append(li);}
  for(const e of session.events){
   const li=document.createElement('li');let text;
   if(e.type==='move')text=`${e.action}: (${e.from.map(v=>v+1).join(', ')}) → (${e.to.map(v=>v+1).join(', ')})${e.blocked?' · blocked':''}${e.won?' · escaped':''}`;
   else if(e.type==='judgment')text=`Judgment ${e.stamp}: ${names[e.guess]} / author ${names[e.author]} · ${e.match?'matched':'not matched'} · ${e.first?'first':'retry'}`;
   else if(e.type==='teleport')text=`Position changed to ${coord(e.to)}.`;
   else if(e.type==='undo')text=`Undo ${e.kind}; judgment history retained.`;
   else if(e.type==='reset')text=`Reset → round ${e.nextRound}. Judgment history retained.`;
   else if(e.type==='hint')text=e.message;
   else if(e.type==='preview')text=`Preview ${e.candidates.length} candidate position(s).`;
   else text=`${e.type==='offer'?'Stamp reached':e.type==='open'?'Stamp opened':'Stamp skipped'}: ${e.stamp}`;
   li.textContent=`Round ${e.round} · ${text}`;list.append(li);
  }
 }
 function move(direction){
  const before=session;
  action(s=>S.move(s,direction),()=>session.won?`Escaped in ${session.moves} moves. Stamp matches are optional and do not determine victory.`:session===before?'':session.eligible?'A sealed stamp is available. Open it or keep moving.':`Player at ${coord(session.position)}.`);
 }
 document.querySelectorAll('[data-move]').forEach(button=>button.addEventListener('click',()=>move(button.dataset.move)));
 document.addEventListener('keydown',event=>{
  if(editing||session.pending||event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,textarea,select,summary,.workshop-guide'))return;
  const direction={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left',w:'up',d:'right',s:'down',a:'left'}[event.key];if(direction){event.preventDefault();move(direction);}
 });
 let touch=null;
 $('board').addEventListener('pointerdown',event=>{if(!editing&&!session.pending&&event.pointerType!=='mouse')touch={x:event.clientX,y:event.clientY};});
 $('board').addEventListener('pointerup',event=>{if(!touch)return;const dx=event.clientX-touch.x,dy=event.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))>20)move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));});
 $('board').addEventListener('pointercancel',()=>touch=null);
 $('undo').addEventListener('click',()=>action(S.undo,'Position change undone. Used guesses and judgment history are retained.'));
 $('reset').addEventListener('click',()=>action(S.reset,'New round. Stamps are restored; cumulative judgments and Reset count are retained.'));
 $('hint').addEventListener('click',()=>action(S.hint,()=>session.message));
 function loadLevel(index){const level=levels[index];load(level.board,level.name,level.prompt,index,examples[index]??[]);}
 $('levels').addEventListener('change',event=>{if(event.target.value!=='custom')loadLevel(Number(event.target.value));});$('next').addEventListener('click',()=>loadLevel(levelIndex+1));
 function renderAuthor(){
  $('author-location').textContent=selected?coord(selected):'Tap a stopping point, then choose a label.';
  $('stamp-total').textContent=`${draftStamps.length} / 2 author stamps`;
  const mark=selected&&draftStamps.find(t=>S.key(t.position)===S.key(selected));
  document.querySelectorAll('[data-author-label]').forEach(button=>{button.disabled=!selected;button.setAttribute('aria-pressed',String(Boolean(mark&&mark.label===button.dataset.authorLabel)));});
  $('remove-stamp').disabled=!mark;$('author-list').replaceChildren();
  for(const stamp of draftStamps){const li=document.createElement('li');li.append(makeButton(`(${stamp.position.map(v=>v+1).join(', ')}) · ${describe(stamp.label)}`,()=>{selected=stamp.position.slice();document.querySelector('input[name=tool][value=stamp]').checked=true;render();}));$('author-list').append(li);}
 }
 function paint(r,c){
  const tool=document.querySelector('input[name=tool]:checked').value;
  if(tool==='stamp'){selected=[r,c];render();announce('Choose Stop, Turn, or Detour. Highlights depend only on the board, not on the label.');return;}
  if(tool==='S'||tool==='E')draft=draft.map(row=>row.map(v=>v===tool?'.':v));draft[r][c]=tool;
  if(tool!=='.')draftStamps=draftStamps.filter(t=>S.key(t.position)!==`${r},${c}`);selected=null;render();announce('Board updated. Check & play verifies solvability and stamp locations.');
 }
 $('edit').addEventListener('click',()=>{if(session.pending)return;editing=true;draft=session.board.map(row=>row.split(''));draftStamps=clone(session.stamps);selected=null;document.querySelector('input[name=tool][value=stamp]').checked=true;render();announce('Author mode. Tap a reachable stop, then choose its label. No typing is required.');});
 $('cancel-edit').addEventListener('click',()=>{editing=false;selected=null;render();announce('Editing canceled. Your current session and audit are unchanged.');});
 $('blank').addEventListener('click',()=>{draft=Array.from({length:7},()=>Array(7).fill('.'));draft[0][0]='S';draft[6][6]='E';draftStamps=[];selected=null;render();announce('Fresh board. Build an escape route, then place stamps.');});
 document.querySelectorAll('[data-author-label]').forEach(button=>button.addEventListener('click',()=>{
  if(!selected)return;
  try{
   const id=S.key(selected),candidate=draftStamps.filter(t=>S.key(t.position)!==id);candidate.push({position:selected.slice(),label:button.dataset.authorLabel});
   draftStamps=S.validate(draft.map(row=>row.join('')),candidate);render();announce('Author stamp saved. The selected label is hidden during play.');
  }catch(error){announce(error.message);}
 }));
 $('remove-stamp').addEventListener('click',()=>{draftStamps=draftStamps.filter(t=>S.key(t.position)!==S.key(selected));render();announce('Stamp removed.');});
 $('play-custom').addEventListener('click',()=>{try{load(draft.map(row=>row.join('')),'Your stamp board','What did your partner intend?',null,draftStamps);}catch(error){announce(error.message);}});
 $('export').addEventListener('click',()=>{
  try{$('board-code').value=S.encode(editing?draft.map(row=>row.join('')):session.board,editing?draftStamps:session.stamps);$('board-code').focus();$('board-code').select();announce('Copy the whole code to a partner using Misdelivered Stamp. It carries author labels, not session judgments.');}catch(error){announce(error.message);}
 });
 $('import').addEventListener('click',()=>{try{if(session.pending)throw new Error('Finish or leave the current stamp interaction first.');const data=S.parse($('board-code').value);load(data.board,'Exchanged stamp board','What did your partner intend?',null,data.stamps);}catch(error){announce(error.message);}});
 $('download').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(S.exportTrace(session),null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='misdelivered-stamp-trace.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 $('review-file').addEventListener('change',async event=>{
  const output=$('review-summary');output.replaceChildren();const file=event.target.files[0];if(!file)return;
  try{if(file.size>2000000)throw new Error('Choose a trace file smaller than 2 MB.');const data=S.reviewTrace(await file.text());appendStats(output,data.stats,data.resetCount,data.round);
   const list=document.createElement('ul');for(const j of data.judgments){const li=document.createElement('li');li.textContent=`Round ${j.round} · (${j.stamp.split(',').map(Number).map(v=>v+1).join(', ')}) · Author: ${names[j.author]} / Player: ${names[j.guess]} · ${j.match?'matched':'not matched'} · ${j.first?'first':'retry'}`;list.append(li);}output.append(list);
  }catch(error){output.textContent=error.message;}
 });
 document.querySelectorAll('[data-guide]').forEach(button=>button.addEventListener('click',()=>{const guide=$(button.dataset.guide);guide.open=true;guide.querySelector('summary').focus({preventScroll:true});guide.scrollIntoView({block:'start'});}));
 loadLevel(0);
})();
