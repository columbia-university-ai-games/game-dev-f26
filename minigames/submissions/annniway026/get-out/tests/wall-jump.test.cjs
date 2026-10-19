const {test}=require('node:test');
const assert=require('node:assert/strict');
const game=require('../engine.js');

test('open adjacent cells retain sliding, stopping before a later wall',()=>{
 for(const [board,position] of [[['S...','...E'],[0,3]],[['S..#.', '....E'],[0,2]]]){
  const s=game.create(board),next=game.step(s,'right');
  assert.deepEqual(next.position,position);assert.equal(next.moves,1);
 }
});
test('jump exactly one wall and stop before another separate wall block',()=>{
 for(const row of ['S#..E','S#.#.E']){
  const s=game.create([row,'.'.repeat(row.length)]),next=game.step(s,'right');
  assert.deepEqual(next.position,[0,row.indexOf('.')]);assert.equal(next.moves,1);
  assert.deepEqual(s.position,[0,0]);assert.equal(s.moves,0);
 }
});
test('wall runs reaching any boundary cancel without spending a move',()=>{
 for(const [board,action] of [[['S###','...E'],'right'],[['###S','E...'],'left'],[['S.','#.','#E'],'down'],[['#E','#.','S.'],'up']]){
  const s=game.create(board);assert.equal(game.step(s,action),s);
  assert.ok(!game.legalActions(s).includes(action));
 }
});
test('jumps work left, up and down and can land on start',()=>{
 for(const [board,action,expected] of [[['E.#S','....'],'left',[0,1]],[['.E','#.','S.'],'up',[0,0]],[['S.','#.','.E'],'down',[2,0]]]){
  assert.deepEqual(game.step(game.create(board),action).position,expected);
 }
 const s=game.create(['S#..','...E']);
 assert.deepEqual(game.step(game.step(s,'right'),'left').position,[0,0]);
});
test('landing on exit wins, solver and legal actions include jumps, terminal states stay still',()=>{
 const s=game.create(['S#E','###']);
 assert.deepEqual(game.legalActions(s),['right']);assert.deepEqual(game.solve(s),['right']);
 const won=game.step(s,'right');assert.equal(won.won,true);assert.equal(won.moves,1);
 assert.equal(game.step(won,'left'),won);
 assert.throws(()=>game.step(s,'teleport'),/direction/i);
});


test('two or more consecutive walls refuse movement even with a landing',()=>{
 for(const [board,action] of [[['S##.E','.....'],'right'],[['S###.E','......'],'right'],[['E.##S','.....'],'left'],[['S.','#.','#.','.E'],'down'],[['.E','#.','#.','S.'],'up']]){
  const s=game.create(board),before=game.observe(s);
  assert.equal(game.step(s,action),s);assert.deepEqual(game.observe(s),before);
  assert.ok(!game.legalActions(s).includes(action));
 }
 assert.equal(game.solve(game.create(['S##E','####'])),null);
});
test('a single wall at each edge has no landing and spends no move',()=>{
 for(const [board,action] of [[['S#','E.'],'right'],[['#S','.E'],'left'],[['SE','#.'],'down'],[['#.','SE'],'up']]){
  const s=game.create(board);assert.equal(game.step(s,action),s);
  assert.equal(s.moves,0);assert.ok(!game.legalActions(s).includes(action));
 }
});
