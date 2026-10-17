const {test}=require('node:test');
const assert=require('node:assert/strict');
const game=require('../engine.js');
const board=['S..','...','..E'];
test('budget is shortest solution plus two and blocked moves are free',()=>{
 const state=game.create(board);assert.equal(state.remaining,4);
 assert.equal(game.step(state,'up'),state);
 assert.equal(game.step(state,'right').remaining,3);
 assert.equal(game.observe(state).remaining,4);
});
test('last unsuccessful move fails and failure is terminal',()=>{
 const state=game.create(board,1),failed=game.step(state,'down');
 assert.equal(failed.remaining,0);assert.equal(failed.failed,true);
 assert.equal(game.step(failed,'right'),failed);
 assert.deepEqual(game.legalActions(failed),[]);
 assert.equal(game.solve(failed),null);
 assert.equal(game.create(board).remaining,4);
});
test('escaping on the final move wins and solver respects the budget',()=>{
 assert.equal(game.solve(game.create(board,1)),null);
 const state=game.create(board,2);assert.deepEqual(game.solve(state),['right','down']);
 const won=game.step(game.step(state,'right'),'down');
 assert.equal(won.remaining,0);assert.equal(won.won,true);assert.equal(won.failed,false);
});
