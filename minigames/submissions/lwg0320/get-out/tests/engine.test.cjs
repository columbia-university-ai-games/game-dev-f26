const {test}=require('node:test');
const assert=require('node:assert/strict');
const game=require('../engine.js');
const board=['S.....1','.......','.......','4......','.......','.......','3.....2'];

test('sliding stops at each numbered exit and 1-2-3-4 wins',()=>{
 let state=game.create(board);
 for(const [action,number] of [['right',2],['down',3],['left',4],['up',5]]){
  state=game.step(state,action);
  assert.equal(state.nextNumber,number);
 }
 assert.equal(state.won,true);
 assert.equal(state.lost,false);
 assert.deepEqual(state.position,[3,0]);
 assert.equal(state.moves,4);
});

test('a repeated exit in 1-2-1 ends the run',()=>{
 let state=game.create(board);
 for(const action of ['right','down']) state=game.step(state,action);
 const lost=game.step(state,'up');
 assert.equal(lost.lastHit,1);
 assert.equal(lost.nextNumber,3);
 assert.equal(lost.lost,true);
 assert.equal(lost.won,false);
 assert.equal(game.step(lost,'left'),lost);
 assert.deepEqual(game.legalActions(lost),[]);
});

test('hitting 1-2-4 loses because exit 3 was next',()=>{
 let state=game.create(['S..1','....','4..2','3...']);
 for(const action of ['right','down']) state=game.step(state,action);
 const lost=game.step(state,'left');
 assert.equal(lost.lastHit,4);
 assert.equal(lost.nextNumber,3);
 assert.equal(lost.lost,true);
});

test('blocked and unknown actions do not spend moves',()=>{
 const state=game.create(board);
 assert.equal(game.step(state,'up'),state);
 assert.throws(()=>game.step(state,'teleport'),/direction/i);
});

test('solver finds the hand-checked shortest route and rejects unreachable sequences',()=>{
 assert.deepEqual(game.solve(game.create(board)),['right','down','left','up']);
 const unreachable=['S#..1','#####','4...2','3....','.....'];
 assert.equal(game.solve(game.create(unreachable)),null);
});

test('invalid boards fail before play',()=>{
 assert.deepEqual(game.solve(game.create(['S.1','..2'])),['right','down']);
 for(const candidate of [[],['SS12'],['S..1'],['S.1','..3'],['S.1','..1'],['S?1','..2'],['S.1','..2',42],Array(21).fill('S.1')]){
  assert.throws(()=>game.create(candidate));
 }
});

test('observations are detached and legal actions match movement',()=>{
 const state=game.create(board);
 assert.deepEqual(game.legalActions(state),['right','down']);
 const observation=game.observe(state);
 observation.position[0]=99;observation.board[0]='broken';
 assert.deepEqual(state.position,[0,0]);
 assert.equal(state.board[0],board[0]);
 assert.equal(observation.nextNumber,1);
});

test('every teaching board is solvable and its route reaches all exits in order',()=>{
 const levels=require('../levels.js');
 for(const level of levels){
  const initial=game.create(level.board),solution=game.solve(initial);
  assert.ok(solution && solution.length>0,level.name);
  const final=solution.reduce((state,action)=>game.step(state,action),initial);
  assert.equal(final.won,true,level.name);
  assert.equal(final.lost,false,level.name);
 }
});
