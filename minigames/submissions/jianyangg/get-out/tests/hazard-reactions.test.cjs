const {test} = require('node:test');
const assert = require('node:assert/strict');
const game = require('../engine.js');
const campaign = require('../campaign.js');
const lavaBoard = ['#######','#....E#','#S.~..#','#######'];
function hitLava() { return game.tick(game.tick(game.input(game.create(lavaBoard), 'right'))); }

test('lava contact starts a small rebound, then another contact costs another third', () => {
  let state = hitLava();
  assert.deepEqual(state.position, [2,2]);
  assert.equal(state.health, 14);
  assert.equal(state.grounded, false);
  assert.equal(state.bounceTicks, 2);
  assert.deepEqual(state.impact.normal, [0,-1]);
  state = game.tick(state);state = game.tick(state);
  assert.equal(state.health, 14);
  state = game.tick(state);
  assert.equal(state.health, 13);
  assert.equal(state.event, 'lava');
});

test('air steering can escape a lava rebound without restoring hearts', () => {
  let state = game.input(hitLava(), 'up');
  assert.deepEqual(state.position, [1,2]);
  for (let i=0;i<12&&!state.won;i++) state=game.tick(state);
  assert.equal(state.won, true);
  assert.equal(state.health, 14);
});

test('spike impact preserves its contact position for the death effect before respawn', () => {
  let state = game.create(['#######','#S..^E#','#######']);
  state = game.input(state,'right');for(let i=0;i<3;i++) state=game.tick(state);
  assert.equal(state.event,'spike');
  assert.deepEqual(state.position,[1,1]);
  assert.deepEqual(state.impact.position,[1,3]);
  assert.equal(state.impact.kind,'spike');
  const observed=game.observe(state);observed.impact.position[0]=99;observed.impact.normal[0]=99;
  assert.deepEqual(state.impact.position,[1,3]);assert.deepEqual(state.impact.normal,[0,-1]);
  assert.equal(state.health,12);
});

test('a fatal hit retains its effect metadata when the campaign restarts', () => {
  let run = campaign.create([{board:['#####','#S^E#','#####']}]);
  for(let i=0;i<5;i++) run=campaign.tick(campaign.input(run,'right'));
  assert.equal(run.restarts,1);
  assert.equal(run.impact.kind,'spike');
  assert.deepEqual(run.impact.position,[1,1]);
  assert.equal(run.state.health,15);
});
test('landing on a safe block between lava contacts cannot make lava standable', () => {
  let state=game.create(['######','#...E#','#.S.~#','##~###','######']);
  state=game.tick(state);
  state=game.input(state,'steer-right');
  assert.equal(state.grounded,true);
  state=game.input(state,'right');state=game.tick(state);
  assert.equal(state.grounded,false);
  assert.equal(state.bounceTicks,2);
  assert.equal(state.health,13);
});
