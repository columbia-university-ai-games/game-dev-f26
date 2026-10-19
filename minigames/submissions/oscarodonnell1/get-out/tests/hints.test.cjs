const {test}=require('node:test');
const assert=require('node:assert/strict');
const game=require('../engine.js');
const hints=require('../hints.js');

test('help reveals a question, a clue, and a move only when requested',()=>{
  const state=game.create(['S..','...','..E']);
  const before=structuredClone(state);
  let shown=[];
  shown=hints.reveal(state,shown);
  assert.equal(shown.length,1);
  assert.equal(shown[0].kind,'question');
  assert.match(shown[0].message,/\?$/);
  assert.equal(shown[0].action,undefined);
  shown=hints.reveal(state,shown);
  assert.equal(shown.length,2);
  assert.equal(shown[1].kind,'clue');
  assert.match(shown[1].message,/exit.s column/i);
  assert.equal(shown[1].action,undefined);
  shown=hints.reveal(state,shown);
  assert.equal(shown.length,3);
  assert.equal(shown[2].kind,'move');
  assert.equal(shown[2].action,'right');
  assert.match(shown[2].message,/right/);
  assert.strictEqual(hints.reveal(state,shown),shown,'a fourth request adds no help');
  assert.deepEqual(state,before,'requesting help must not play the game');
});

test('a blocked action preserves help; a successful move starts a new sequence',()=>{
  const state=game.create(['S..','...','..E']);
  const shown=hints.reveal(state,[]);
  assert.strictEqual(hints.afterMove(state,game.step(state,'up'),shown),shown);
  const next=game.step(state,'right');
  const fresh=hints.afterMove(state,next,shown);
  assert.deepEqual(fresh,[]);
  assert.equal(hints.reveal(next,fresh)[0].kind,'question');
});

test('a one-slide exit gets a truthful alignment clue, including an exit crossed mid-slide',()=>{
  const state=game.create(['S.E..','.....']);
  const question=hints.reveal(state,[]);
  const clue=hints.reveal(state,question);
  assert.match(clue[1].message,/current row/);
  const shown=hints.reveal(state,clue);
  assert.equal(game.step(state,shown[2].action).won,true);
});

test('a position with no solution gives staged recovery help, never an invented move',()=>{
  const start=game.create(['.....','.S.E.','.....']);
  assert.deepEqual(game.solve(start),['right'],'the board is solvable at the start');
  const state=game.step(start,'up');
  assert.equal(game.solve(state),null,'this move loses the route');
  let shown=hints.reveal(state,[]);
  assert.equal(shown[0].kind,'question');
  shown=hints.reveal(state,shown);
  assert.match(shown[1].message,/no route.*this position/i);
  assert.equal(shown[1].unreachable,true);
  shown=hints.reveal(state,shown);
  assert.equal(shown[2].kind,'recovery');
  assert.match(shown[2].message,/Undo.*Reset/);
  assert.equal(shown[2].action,undefined);
});

test('a completed board never offers another hint',()=>{
  const won=game.step(game.create(['SE','..']),'right');
  const shown=[];
  assert.strictEqual(hints.reveal(won,shown),shown);
});

test('move hints from every reachable teaching-board position lead to the exit',()=>{
  for(const level of require('../levels.js')){
    const queue=[game.create(level.board)],seen=new Set();
    for(let i=0;i<queue.length;i++){
      const state=queue[i],key=state.position.join(',');
      if(seen.has(key))continue;
      seen.add(key);
      if(state.won)continue;
      const before=structuredClone(state),path=game.solve(state);
      let shown=[];
      for(let stage=0;stage<3;stage++)shown=hints.reveal(state,shown);
      assert.equal(shown[0].action,undefined);
      assert.equal(shown[1].action,undefined);
      if(path===null){
        assert.equal(shown[2].kind,'recovery');
      }else{
        const action=shown[2].action,next=game.step(state,action);
        assert.notStrictEqual(next,state,`${level.name}: hint must move`);
        const rest=game.solve(next);
        assert.notEqual(rest,null,`${level.name}: hint must preserve a route`);
        assert.equal(rest.reduce((s,a)=>game.step(s,a),next).won,true);
      }
      assert.deepEqual(state,before);
      for(const action of game.legalActions(state))queue.push(game.step(state,action));
    }
  }
});
