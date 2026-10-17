const {test} = require('node:test');
const assert = require('node:assert/strict');
const {controlHint} = require('../control-hint.js');

test('landed instructions identify Space and the surface it jumps away from', () => {
  const text = controlHint({grounded: true, gravity: 'up'});
  assert.match(text, /ceiling/);
  assert.match(text, /hold Space/);
  assert.match(text, /Arrows change gravity/);
});

test('air instructions rotate steering directions and explain the used allowance', () => {
  assert.match(controlHint({gravity: 'down', rise: 1}), /Left or Right/);
  assert.match(controlHint({gravity: 'right', rise: 0}), /Up or Down/);
  assert.match(controlHint({gravity:'right',bounceTicks:2}),/Lava bounce/);
  const text = controlHint({gravity: 'up', steered: true});
  assert.match(text, /Steer used/);
  assert.match(text, /land/);
});
test('an open hold window keeps jump guidance between ascent steps', () => {
  const text=controlHint({gravity:'down',rise:0,extended:false,holdRemaining:2});
  assert.match(text,/Jumping/);assert.match(text,/Space/);assert.doesNotMatch(text,/Falling/);
});
