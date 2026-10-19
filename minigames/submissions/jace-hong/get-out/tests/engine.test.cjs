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
test('every shortest route starts by moving away from the exit',()=>{
 const levels=require('../levels.js');
 const distance=(state)=>{const r=state.board.findIndex(row=>row.includes('E'));return Math.abs(state.position[0]-r)+Math.abs(state.position[1]-state.board[r].indexOf('E'));};
 for(const level of levels){
  const start=game.create(level.board),shortest=game.solve(start).length;
  const best=game.legalActions(start).filter(a=>{const route=game.solve(game.step(start,a));return route&&route.length+1===shortest;});
  assert.ok(best.length>0,level.name);
  for(const action of best)assert.ok(distance(game.step(start,action))>distance(start),`${level.name}: ${action}`);
 }
});
test('completion stats report the first slide, total moves, and the shortest route',()=>{
 const {completionStats}=require('../stats.js');
 const trace=[{type:'move',action:'up',blocked:true},{type:'move',action:'left',blocked:false},{type:'undo'}];
 assert.deepEqual(completionStats(['..S#.','.#...','...#.','...E.','#....'],trace,5),{firstMove:'left',moves:5,shortest:3});
});
