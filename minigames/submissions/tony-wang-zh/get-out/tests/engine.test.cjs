const {test}=require('node:test');
const assert=require('node:assert/strict');
const game=require('../engine.js');

test('player and exit slide together and stop independently at walls and edges',()=>{
 const s=game.create(['S.#..','.....','...E.']);
 const next=game.step(s,'right');
 assert.deepEqual(next.position,[0,1]);
 assert.deepEqual(next.exitPosition,[2,4]);
 assert.equal(next.moves,1);assert.equal(next.won,false);
 assert.deepEqual(s.position,[0,0]);assert.deepEqual(s.exitPosition,[2,3]);
});
test('a blocked paired action does not spend a move',()=>{
 const s=game.create(['S#.', '###', 'E#.']);
 assert.equal(game.step(s,'up'),s);
 assert.throws(()=>game.step(s,'teleport'),/direction/i);
});
test('the player wins when the moving exit and player meet during a paired slide',()=>{
 const s=game.create(['S..','..E','...']);
 const won=game.step(s,'down');
 assert.deepEqual(won.position,[2,0]);assert.deepEqual(won.exitPosition,[2,2]);
 assert.equal(won.won,false);
 const final=game.step(won,'right');
 assert.deepEqual(final.position,[2,2]);assert.deepEqual(final.exitPosition,[2,2]);
 assert.equal(final.won,true);assert.equal(game.step(final,'up'),final);
});
test('solver searches both positions and finds a shortest path',()=>{
 const start=game.create(['S..','..E','...']),solution=game.solve(start);
 assert.equal(solution.length,2);
 assert.equal(solution.reduce((s,a)=>game.step(s,a),start).won,true);
 assert.equal(game.solve(game.create(['S#E','###','...'])),null);
});
test('invalid imported boards fail before play',()=>{
 for(const b of [[],['S.E','..'],['SSE'],['S..'],['S?E'],['S.E',42],Array(21).fill('S.E')]){
  assert.throws(()=>game.create(b));
 }
});
test('observations include detached positions and legal actions reflect paired movement',()=>{
 const s=game.create(['S..','...','E..']);
 assert.deepEqual(game.legalActions(s),['up','right','down']);
 const obs=game.observe(s);obs.position[0]=99;obs.exitPosition[0]=99;obs.board[0]='broken';
 assert.deepEqual(s.position,[0,0]);assert.deepEqual(s.exitPosition,[2,0]);assert.equal(s.board[0],'S..');
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
