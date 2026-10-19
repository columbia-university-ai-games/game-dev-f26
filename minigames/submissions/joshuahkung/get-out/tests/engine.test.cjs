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
test('variation: hints escalate from a question to the stopping feature to the move',()=>{
 const levels=require('../levels.js');
 const s=game.create((levels.levels||levels)[0].board);
 const [q,f,m]=[1,2,3].map(l=>game.hint(s,l));
 assert.equal(q.action,undefined);assert.equal(q.feature,undefined);assert.match(q.message,/\?/);
 assert.deepEqual(f.feature,{type:'wall',cell:[2,0]});assert.equal(f.action,undefined);
 assert.equal(m.action,game.solve(s)[0]);
 assert.throws(()=>game.hint(s,4),/level/i);
});
test('variation: level-2 feature always matches where the solver\'s next slide stops',()=>{
 const levels=require('../levels.js');
 for(const level of (levels.levels||levels)){
  let s=game.create(level.board);
  for(const action of game.solve(s)){
   const f=game.hint(s,2).feature,next=game.step(s,action);
   if(f.type==='wall')assert.equal(s.board[f.cell[0]][f.cell[1]],'#');
   else assert.deepEqual(f.cell,next.position);
   s=next;
  }
  assert.equal(s.won,true);
 }
});
test('variation: hints on an unreachable exit say so at every level',()=>{
 const s=game.create(['S..','.E.','...']);
 for(const l of [1,2,3])assert.equal(game.hint(s,l).path,null);
});
