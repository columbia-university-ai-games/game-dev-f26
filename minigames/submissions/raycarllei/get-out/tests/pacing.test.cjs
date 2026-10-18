const {test} = require('node:test');
const assert = require('node:assert/strict');
const game = require('../engine.js');
const levels = require('../levels.js');

// Structural progression is checked separately from human difficulty.
test('teaching sequence fills each step from 3 to 9 moves and names its lesson', () => {
  assert.deepEqual(levels.map(level => game.solve(game.create(level.board)).length), [3,4,5,6,7,8,9]);
  for (const level of levels) {
    assert.ok(level.stage && level.lesson && level.prompt);
  }
});
test('each bridge changes at most two cells from its following original board', () => {
  for (const index of [1,3,5]) {
    const a=levels[index].board.join(''), b=levels[index+1].board.join('');
    const differences=[...a].filter((cell,i)=>cell!==b[i]).length;
    assert.ok(differences>=1 && differences<=2);
  }
});
test('every reachable position on every teaching board still has a route', () => {
  for (const level of levels) {
    const queue=[game.create(level.board)], seen=new Set();
    for(let i=0;i<queue.length;i++) {
      const state=queue[i], id=state.position.join(',');
      if(seen.has(id))continue;seen.add(id);
      assert.notEqual(game.solve(state),null,`${level.name}: ${id}`);
      for(const action of game.legalActions(state))queue.push(game.step(state,action));
    }
  }
});
test('three requested hint tiers preserve state and end at the solver next move', () => {
  const {hint}=require('../pacing.js');
  for (const level of levels) {
    const queue=[game.create(level.board)], seen=new Set();
    for(let i=0;i<queue.length;i++) {
      const state=queue[i], id=state.position.join(',');
      if(seen.has(id)||state.won)continue;seen.add(id);
      const before=JSON.stringify(state), route=game.solve(state);
      const question=hint(state,1), feature=hint(state,2), move=hint(state,3);
      assert.equal(question.tier,1);assert.equal(question.target,null);
      assert.equal(question.action,null);
      assert.equal(feature.action,null);
      assert.deepEqual(feature.target,game.step(state,route[0]).position);
      assert.equal(move.action,route[0]);
      assert.ok(game.legalActions(state).includes(move.action));
      assert.equal(hint(state,99).tier,3);
      feature.target[0]=99;
      assert.equal(JSON.stringify(state),before);
      for(const action of game.legalActions(state))queue.push(game.step(state,action));
    }
  }
});
test('hints handle wins and custom-board dead ends without inventing moves', () => {
  const {hint}=require('../pacing.js');
  const start=game.create(['S.E','...']);
  const won=game.step(start,'right');
  assert.equal(hint(won,1).target,null);assert.equal(hint(won,1).action,null);
  const stuck=game.create(['S..','.E.','...']);
  for(const tier of [1,2,3]) {
    const help=hint(stuck,tier);
    assert.equal(help.target,null);assert.equal(help.action,null);
    assert.match(help.message,/Undo.*Reset/);
  }
});
test('repeated blocked attempts and loops offer help; hint or Undo starts a fresh window', () => {
  const {needsNudge}=require('../pacing.js');
  const blocked={type:'move',blocked:true,to:[0,0]};
  const down={type:'move',blocked:false,to:[5,0]};
  const up={type:'move',blocked:false,to:[0,0]};
  assert.equal(needsNudge([]),false);
  assert.equal(needsNudge([blocked]),false);
  assert.equal(needsNudge([blocked,{type:'notebook-toggle'},blocked]),true);
  assert.equal(needsNudge([down,up,down,up,down]),true);
  for(const event of [{type:'hint'},{type:'undo'}]) {
    assert.equal(needsNudge([blocked,blocked,event]),false);
    assert.equal(needsNudge([blocked,blocked,event,blocked]),false);
  }
  assert.equal(needsNudge([down,{...up,to:[1,1]},{...up,to:[2,2]}]),false);
});
