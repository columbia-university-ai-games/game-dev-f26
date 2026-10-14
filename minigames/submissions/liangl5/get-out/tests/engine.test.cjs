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
test('every teaching board is solvable under the thin-ice rule',()=>{
 const levels=require('../levels.js');
 for(const level of levels){
  const initial=game.create(level.board),solution=game.solve(initial);
  assert.ok(solution,level.name);
  const final=solution.reduce((s,a)=>game.step(s,a),initial);
  assert.equal(final.won,true,level.name);assert.ok(!final.died,level.name);
 }
});
test('sliding back over a used square, including the start, falls through the ice',()=>{
 const s=game.create(['S..','...','..E']);
 const right=game.step(s,'right');assert.deepEqual(right.visited,new Set(['0,0','0,1','0,2']));
 const fell=game.step(right,'left');assert.equal(fell.died,true);assert.deepEqual(fell.position,[0,1]);
 assert.deepEqual(game.step(fell,'down'),fell);assert.deepEqual(game.legalActions(fell),[]);
});
test('the solver avoids routes that cross ice',()=>{
 const s=game.create(['S.#','...','#.E']);
 const path=game.solve(s),final=path.reduce((st,a)=>game.step(st,a),s);
 assert.equal(final.won,true);assert.ok(!final.died);
 // Solvable in the reference game, but every route there re-crosses ice.
 assert.equal(game.solve(game.create(['S#.....','.....##','...#.#.','..#.E.#','.......','.......','...#...'])),null);
});
