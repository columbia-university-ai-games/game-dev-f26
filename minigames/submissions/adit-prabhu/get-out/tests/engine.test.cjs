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
  const final=solution.reduce((s,a)=>game.step(s,a),initial);
  assert.equal(final.won,true,level.name);
 }
});
test('a wall cracks on the first collision and breaks on the second',()=>{
 const s=game.create(['S..#.','....E']);
 const hit=game.step(s,'right');
 assert.deepEqual(hit.position,[0,2]);assert.equal(hit.board[0],'S..x.');assert.equal(hit.moves,1);
 const broken=game.step(hit,'right');
 assert.deepEqual(broken.position,[0,2]);assert.equal(broken.board[0],'S....');assert.equal(broken.moves,2);
 assert.deepEqual(game.step(broken,'right').position,[0,4]);
 assert.equal(s.board[0],'S..#.');assert.equal(hit.board[0],'S..x.');
});
test('the outer edge never breaks and pushing it spends no move',()=>{
 const s=game.create(['S.E','...']);
 assert.equal(game.step(s,'up'),s);assert.equal(game.step(s,'left'),s);
});
test('the solver plans routes through breakable walls',()=>{
 const s=game.create(['S#E','###']);
 assert.deepEqual(game.solve(s),['right','right','right']);
 assert.equal(game.solve(game.create(['S#.','###','..E'])).length>0,true);
});
test('reaching the exit before a wall wins without damaging the wall',()=>{
 const won=game.step(game.create(['SE#','...']),'right');
 assert.equal(won.won,true);assert.equal(won.board[0],'SE#');
});
test('pushing into an adjacent wall is a legal action',()=>{
 assert.deepEqual(game.legalActions(game.create(['S#E','...'])),['right','down']);
});
test('the solver stops with a clear error instead of freezing on huge searches',()=>{
 const rows=Array.from({length:20},(_,r)=>Array.from({length:20},(_,c)=>(r*7+c*3)%5<3?'#':'.'));
 rows[0][0]='S';rows[19][19]='E';
 const s=game.create(rows.map(r=>r.join(''))),t=Date.now();
 try{game.solve(s,2000);}catch(e){assert.match(e.message,/too complex/);}
 assert.ok(Date.now()-t<5000);
});
