const {test}=require('node:test');
const assert=require('node:assert/strict');
const game=require('../engine.js');
const board=['S..#.', '.....', '.#...', '...E.', '.....'];
test('slides to a wall or border without mutating the input',()=>{
 const s=game.create(board);const next=game.step(s,'right');
 assert.deepEqual(next.position,[0,2]);assert.equal(next.moves,1);
 assert.deepEqual(s.position,[0,0]);assert.equal(s.moves,0);
 assert.deepEqual(game.step(s,'down').position,[4,0]);
});
test('blocked and unknown actions do not spend moves',()=>{
 const s=game.create(board);assert.deepEqual(game.step(s,'up'),s);
 assert.throws(()=>game.step(s,'teleport'),/direction/i);
});
test('reaching an exit mid-slide wins and terminal states cannot move',()=>{
 const s=game.create(['S.E..','.....','.....']);
 const won=game.step(s,'right');assert.deepEqual(won.position,[0,2]);
 assert.equal(won.won,true);assert.deepEqual(game.step(won,'down'),won);
});
test('solver finds the hand-checked shortest path and identifies unreachable exits',()=>{
 assert.deepEqual(game.solve(game.create(['S..','...','..E'])),['right','down']);
 assert.equal(game.solve(game.create(['S..','.E.','...'])),null);
});
test('invalid imported boards fail before play',()=>{
 for(const b of [[],['S.E','..'],['SSE'],['S..'],['S?E'],['S.E',42],Array(21).fill('S.E')]){
  assert.throws(()=>game.create(b));
 }
});
test('observations are detached and legal actions follow actual movement',()=>{
 const s=game.create(board);assert.deepEqual(game.legalActions(s),['right','down']);
 const obs=game.observe(s);obs.position[0]=99;obs.board[0]='broken';
 assert.deepEqual(s.position,[0,0]);assert.equal(s.board[0],board[0]);
});
test('every teaching board is solvable and its solution reaches the exit',()=>{
 const levels=require('../levels.js');
 for(const level of levels){
  const initial=game.create(level.board),solution=game.solve(initial);
  assert.ok(solution && solution.length>0,level.name);
  const final=solution.reduce((s,a)=>(a==='wait'?game.tick(s):game.step(s,a)),initial);
  assert.equal(final.won,true,level.name);
 }
});



test('wall keeps moving on ticks and player stops at the normal spot',()=>{
 const s=game.create(['....E','.....','..M..','.....','..S..']);
 const n=game.step(s,'up');assert.deepEqual(n.position,[3,2]);
 assert.equal(n.board[2][2],'M');assert.equal(s.motions.length,0);
 const t=game.tick(n);assert.equal(t.board[1][2],'M');
 assert.equal(game.tick(t).board[0][2],'M');
 assert.equal(game.tick(game.tick(t)).motions.length,0);
});
test('player can intercept and redirect a wall mid-slide using ordinary moves',()=>{
 let s=game.create(['#.....E','.......','..M....','..S....','.......']);
 s=game.step(s,'up');s=game.tick(s);
 assert.equal(s.board[1][2],'M');assert.equal(s.motions[0].direction,'up');
 for(const action of ['left','up','right'])s=game.step(s,action);
 assert.deepEqual(s.position,[1,1]);assert.equal(s.motions[0].direction,'right');
 const t=game.tick(s);assert.equal(t.board[1][3],'M');
 assert.equal(t.board[1][2],'.');assert.equal(s.board[1][2],'M');
});
test('walls stop at fixed walls, moving walls, exit, border, or player',()=>{
 for(const obstacle of ['#','M','E']){
  const rows=['..'+obstacle+'..','..M..','..S..','....E'];
  if(obstacle==='E')rows[3]='.....';
  const s=game.step(game.create(rows),'up'),n=game.tick(s);
  assert.equal(n.board[1][2],'M');assert.equal(n.motions.length,0);
 }
 const s=game.create(['#S.E','....']);assert.equal(game.step(s,'left'),s);
 assert.throws(()=>game.step(s,'diagonal'),/direction/);
 let t=game.step(game.create(['..M..','..S.E','.....']),'up');
 t=game.tick(t);assert.equal(t.motions.length,0);
});
test('observations detach wall headings and terminal ticks change nothing',()=>{
 const s=game.step(game.create(['....E','..M..','..S..']),'up');
 const o=game.observe(s);o.motions[0].direction='left';
 assert.equal(s.motions[0].direction,'up');
 const won={...s,won:true};assert.equal(game.tick(won),won);
});

test('two walls targeting the same empty cell stop without overlapping',()=>{
 const s=game.create(['S...E','M.M..','.....']);
 const active={...s,motions:[{r:1,c:0,direction:'right'},{r:1,c:2,direction:'left'}]};
 const t=game.tick(active);assert.deepEqual(t.board,s.board);assert.deepEqual(t.motions,[]);
});
test('walls stop before the player and restore the start marker after passing it',()=>{
 let s=game.create(['....E','..M..','..S..','.....']);
 s={...s,position:[3,2],motions:[{r:1,c:2,direction:'down'}]};
 const t=game.tick(s);assert.equal(t.board[2][2],'M');
 assert.equal(game.tick(t).motions.length,0);
 const away={...t,position:[3,0]};const n=game.tick(away);
 assert.equal(n.board[2][2],'S');assert.equal(n.board[3][2],'M');
});
test('solver includes a wait when motion alone opens the route',()=>{
 const s=game.create(['#####','#SME#','#...#','#####']);
 const active={...s,motions:[{r:1,c:2,direction:'down'}]};
 const path=game.solve(active);assert.equal(path[0],'wait');
 const won=path.reduce((v,a)=>a==='wait'?game.tick(v):game.step(v,a),active);
 assert.equal(won.won,true);
});
