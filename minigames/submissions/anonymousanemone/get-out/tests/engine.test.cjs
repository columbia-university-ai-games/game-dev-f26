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

test('collision pushes a block to the end and stops behind it; history stays immutable',()=>{
 const s=game.create(['S.B..','....E']);
 const next=game.step(s,'right');
 assert.deepEqual(next.position,[0,3]);assert.equal(next.board[0],'S...B');
 assert.equal(next.moves,1);assert.equal(s.board[0],'S.B..');
 assert.equal(game.step(next,'right'),next);
});
test('push is refused against wall, block, exit or boundary',()=>{
 for(const board of [['SB#','..E'],['SBB.','...E'],['SBE','...'],['SB','E.']]){
  const s=game.create(board);assert.equal(game.step(s,'right'),s);
 }
});
test('solver includes block layouts and solves the push teaching board',()=>{
 const s=game.create(['SB..','##E#']);
 const path=game.solve(s);assert.deepEqual(path,['right','down']);
 assert.equal(path.reduce((state,a)=>game.step(state,a),s).won,true);
 const obs=game.observe(game.step(s,'right'));assert.equal(obs.board[0],'S..B');
});

test('ten push puzzles require pushing and increase shortest-route length',()=>{
 const levels=require('../levels.js');
 assert.equal(levels.length,10);
 let previous=0;
 for(const level of levels){
  assert.ok(level.board.join('').includes('B'),level.name);
  const initial=game.create(level.board),path=game.solve(initial);
  assert.ok(path && path.length>previous,level.name);
  previous=path.length;
  assert.equal(game.solve(game.create(level.board.map(row=>row.replaceAll('B','#')))),null,`${level.name}: pushing must matter`);
  const final=path.reduce((s,a)=>game.step(s,a),initial);
  assert.equal(final.won,true,level.name);
  assert.notDeepEqual(final.board,initial.board,level.name);
 }
});
