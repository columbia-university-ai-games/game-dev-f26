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

test('pushes one wall one cell, enters its old square and stops; input stays intact',()=>{
 const s=game.create(['S.W..','....E']); const n=game.step(s,'right');
 assert.deepEqual(n.position,[0,2]);assert.equal(n.board[0],'S..W.');
 assert.equal(n.moves,1);assert.equal(s.board[0],'S.W..');
 assert.deepEqual(s.position,[0,0]);
});
test('cannot push walls onto exit, fixed walls, other walls or beyond edge',()=>{
 for(const board of [['SWE','...'],['SW#.','...E'],['SWW.','...E'],['SW','E.']]){
  const s=game.create(board);assert.equal(game.step(s,'right'),s);
  assert.ok(!game.legalActions(s).includes('right'));
 }
 const s=game.create(['S.W#','...E']);const n=game.step(s,'right');
 assert.deepEqual(n.position,[0,1]);assert.equal(n.board[0],s.board[0]);
});
test('solver includes wall layout and follows the pushing rules',()=>{
 const s=game.create(['S.W..','##.##','..E..']);
 const path=game.solve(s);assert.deepEqual(path,['right','down']);
 const won=path.reduce((state,a)=>game.step(state,a),s);assert.equal(won.won,true);
 assert.equal(game.step(won,'left'),won);
 const obs=game.observe(game.step(s,'right'));obs.board[0]='broken';
 assert.equal(s.board[0],'S.W..');
});

test('challenge boards require pushing and include a recoverable-by-undo dead end',()=>{
 for(const level of require('../levels.js').slice(1)){
  assert.equal(game.solve(game.create(level.board.map(row=>row.replaceAll('W','#')))),null);
  const initial=game.create(level.board),queue=[initial],seen=new Set();let found=false;
  for(let i=0;i<queue.length&&!found;i++){
   const s=queue[i];if(s.won)continue;
   for(const a of game.legalActions(s)){
    const n=game.step(s,a),key=n.position+':'+n.board.join('/');
    if(seen.has(key))continue;seen.add(key);queue.push(n);
    if(n.board!==s.board&&game.solve(s)&&game.solve(n)===null){
     found=true;assert.ok(game.solve(s)); // History retains this solvable state for undo.
     break;
    }
   }
  }
  assert.ok(found,level.name);
 }
});
test('search budget exhaustion is unknown, not an unsolvability claim',()=>{
 assert.equal(game.solve(game.create(['S.W..','##.##','..E..']),1),undefined);
 assert.throws(()=>game.create(['SWWWW','....E']),/three/);
});
