const test = require('node:test');
const assert = require('node:assert/strict');
const game = require('../engine.js');
const levels = require('../levels.js');
const short = ['left','down','right','up','right'];
const guided = ['up','right','up','right','down','right','down'];
function run(path) {
 let state = game.create(levels[0].board);
 const stops = [];
 for (const action of path) {
  const next = game.step(state, action);
  assert.notEqual(next, state, 'Each advertised move must move');
  state = next; stops.push(state.position.join(','));
 }
 assert.equal(state.won, true);
 assert.equal(state.moves, path.length);
 return stops;
}
test('start offers exactly the two advertised route choices', () => {
 assert.deepEqual(game.legalActions(game.create(levels[0].board)).sort(), ['left','up']);
});
test('shortcut wins in five moves and is shortest', () => {
 run(short);
 assert.equal(game.solve(game.create(levels[0].board)).length, 5);
});
test('guided route wins in seven moves without revisiting shortcut stops', () => {
 const a = run(short), b = run(guided);
 assert.equal(a.slice(0,-1).some(stop => b.slice(0,-1).includes(stop)), false);
});
