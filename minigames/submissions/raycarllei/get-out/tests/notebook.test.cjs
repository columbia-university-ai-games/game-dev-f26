const {test} = require('node:test');
const assert = require('node:assert/strict');
const {stoppingPoints} = require('../notebook.js');
const game = require('../engine.js');
const levels = require('../levels.js');

test('records reached stops once, excluding blocked attempts and slide-through tiles', () => {
  const events = [
    {type:'move',from:[0,0],to:[6,0],blocked:false},
    {type:'move',from:[6,0],to:[6,0],blocked:true},
    {type:'move',from:[6,0],to:[0,0],blocked:false},
  ];
  assert.deepEqual(stoppingPoints([0,0],events), [[0,0],[6,0]]);
  assert.ok(!stoppingPoints([0,0],events).some(([r,c])=>r===3&&c===0));
});
test('Undo preserves explored history; a fresh trace resets it', () => {
  const events = [{type:'move',to:[2,0],blocked:false},{type:'undo'},
    {type:'notebook-toggle',shown:false},{type:'hint',message:'Try down.'}];
  assert.deepEqual(stoppingPoints([0,0],events),[[0,0],[2,0]]);
  assert.deepEqual(stoppingPoints([0,0],[]),[[0,0]]);
});
test('notebook copies its inputs and has no effect on the engine or solver', () => {
  for (const level of levels) {
    let state=game.create(level.board);
    const original=JSON.stringify(state);
    const route=game.solve(state);
    const events=[];
    const points=stoppingPoints(state.position,events);
    points[0][0]=999;
    assert.equal(JSON.stringify(state),original);
    assert.deepEqual(game.solve(state),route);
    for (const action of route) {
      const next=game.step(state,action);
      events.push({type:'move',from:state.position,to:next.position,blocked:next===state});
      const before=JSON.stringify(next);
      stoppingPoints(game.create(level.board).position,events);
      assert.equal(JSON.stringify(next),before);
      state=next;
    }
    assert.ok(state.won);
    assert.ok(stoppingPoints(game.create(level.board).position,events).length<=state.moves+1);
  }
});
