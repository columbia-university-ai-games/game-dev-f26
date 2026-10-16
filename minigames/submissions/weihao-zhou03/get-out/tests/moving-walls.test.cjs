const {test} = require('node:test');
const assert = require('node:assert/strict');
const game = require('../engine.js');
const board = ['S....', '.....', '....E', '.....', '.....'];
const rail = {path: [[0,2], [1,2], [2,2]], index: 0, direction: 1};
const setup = () => game.create(board, {movers: [rail]});
const wallPosition = state => state.movers[0].path[state.movers[0].index];

test('a slide stops before the current wall, then the wall advances one cell', () => {
  const initial = setup(), next = game.step(initial, 'right');
  assert.deepEqual(next.position, [0,1]);
  assert.deepEqual(wallPosition(next), [1,2]);
  assert.equal(next.moves, 1);
  assert.deepEqual(wallPosition(initial), [0,2]);
  assert.deepEqual(rail.path, [[0,2], [1,2], [2,2]]);
});

test('Wait spends a turn, preserves the player, and reverses the wall at rail ends', () => {
  let state = setup();
  const expected = [[1,2], [2,2], [1,2], [0,2], [1,2]];
  for (let i=0; i<expected.length; i++) {
    state = game.step(state, 'wait');
    assert.deepEqual(wallPosition(state), expected[i]);
    assert.deepEqual(state.position, [0,0]);
    assert.equal(state.moves, i+1);
  }
});

test('blocked and invalid inputs leave the entire moving-wall phase unchanged', () => {
  const state = setup();
  assert.strictEqual(game.step(state, 'up'), state);
  assert.throws(() => game.step(state, 'teleport'), /direction|action/i);
  assert.deepEqual(wallPosition(state), [0,2]);
  assert.equal(state.moves, 0);
});

test('a wall waits for an occupied rail cell and resumes when the player leaves', () => {
  const options = {movers: [{path: [[0,1], [0,2]], index: 1, direction: -1}]};
  const initial = game.create(['S....', '.....', '....E'], options);
  const stopped = game.step(initial, 'right');
  assert.deepEqual(stopped.position, [0,1]);
  assert.deepEqual(wallPosition(stopped), [0,2]);
  const waiting = game.step(stopped, 'wait');
  assert.deepEqual(waiting.position, [0,1]);
  assert.deepEqual(wallPosition(waiting), [0,2]);
  assert.equal(waiting.moves, 2);
  const left = game.step(waiting, 'down');
  assert.deepEqual(wallPosition(left), [0,1]);
  assert.notDeepEqual(left.position, wallPosition(left));
});

test('winning mid-slide freezes the wall and all later actions', () => {
  const initial = game.create(['S.E..', '.....', '.....'],
    {movers: [{path: [[1,0], [1,1]], index: 0, direction: 1}]});
  const won = game.step(initial, 'right');
  assert.equal(won.won, true);
  assert.deepEqual(won.position, [0,2]);
  assert.deepEqual(wallPosition(won), [1,0]);
  assert.deepEqual(game.legalActions(won), []);
  assert.strictEqual(game.step(won, 'wait'), won);
});

test('observations detach rail data and predict the actual next wall position', () => {
  const state = setup(), obs = game.observe(state);
  assert.deepEqual(obs.movers[0].nextPosition, [1,2]);
  assert.ok(obs.legalActions.includes('wait'));
  obs.movers[0].path[0][0] = 99;
  obs.movers[0].nextPosition[0] = 99;
  assert.deepEqual(wallPosition(state), [0,2]);
  const next = game.step(state, 'wait');
  assert.deepEqual(wallPosition(next), [1,2]);
});

test('an occupied next cell is visibly predicted as a held wall', () => {
  const state = game.step(game.create(['S....','.....','....E'],
    {movers: [{path: [[0,1],[0,2]], index: 1, direction: -1}]}), 'right');
  const mover = game.observe(state).movers[0];
  assert.equal(mover.held, true);
  assert.deepEqual(mover.nextPosition, [0,2]);
});

test('malformed or unsafe rails fail before loading the board', () => {
  for (const movers of [null, {}, [{path: [[0,1]]}],
    [{path: [[0,1],[1,2]]}], [{path: [[0,1],[0,3]]}],
    [{path: [[0,0],[0,1]], index: 0}],
    [{path: [[2,3],[2,4]]}], [{path: [[0,1],[0,2]], index: 9}],
    [{path: [[0,1],[0,2]], direction: 0}],
    [rail, rail]]) {
    assert.throws(() => game.create(board, {movers}));
  }
  assert.throws(() => game.create(['S#..','...E'],
    {movers: [{path: [[0,1],[0,2]]}]}));
});

test('static boards preserve their original controls and do not offer Wait', () => {
  const state = game.create(['S..','...','..E']);
  assert.strictEqual(game.step(state, 'wait'), state);
  assert.deepEqual(game.legalActions(state), ['right','down']);
  assert.deepEqual(game.solve(state), ['right','down']);
});

test('the solver distinguishes the same player position at different wall phases', () => {
  const level = {board:['S...E','#....','.....','.....'],
    movers:[{path:[[0,1],[1,1],[2,1]],index:0,direction:1}]};
  const state = game.create(level.board, level);
  assert.deepEqual(game.solve(state), ['wait','right']);
  const waited = game.step(state, 'wait');
  assert.deepEqual(waited.position, state.position);
  assert.deepEqual(game.solve(waited), ['right']);
});

test('the original single-wall acceptance routes remain supported', () => {
  const levels = [
    {name:'gap',board:['S...E','#....','.....','.....'],movers:[{path:[[0,1],[1,1],[2,1]],index:0,direction:1}]},
    {name:'brake',board:['S....','.....','..E..','.....','.....'],movers:[{path:[[3,2],[3,3],[3,4]],index:1,direction:1}]},
    {name:'combine',board:['S.....','#.E...','......','.....#','......','......'],movers:[{path:[[0,1],[1,1],[2,1],[3,1]],index:0,direction:1}]}
  ];
  const routes = [['wait','right'], ['right','down','left'],
    ['wait','wait','right','down','left','up']];
  levels.forEach((level, i) => {
    const initial = game.create(level.board, level);
    const solution = game.solve(initial);
    assert.equal(solution.length, routes[i].length);
    let state = initial;
    for (const action of routes[i]) {
      state = game.step(state, action);
      assert.notDeepEqual(state.position, wallPosition(state));
    }
    assert.equal(state.won, true, level.name);
    assert.deepEqual(game.solve(state), []);
    if (i > 0) assert.equal(game.solve(game.create(level.board)), null);
  });
});

test('board exchange preserves the initial rail position and direction', () => {
  const code = require('../puzzle-code.js');
  const initial = setup();
  const text = code.encode(initial.board, initial.movers);
  const decoded = code.decode(text);
  assert.deepEqual(game.create(decoded.board, decoded), initial);
  assert.deepEqual(code.decode('S..\n...\n..E'), {board:['S..','...','..E'], movers:[]});
  assert.equal(code.encode(['S..','...','..E']), 'S..\n...\n..E');
  assert.throws(() => code.decode('{"format":'), /whole code/);
  assert.throws(() => code.decode('{"format":"other","board":[],"movers":[]}'), /Moving Walls/);
});
