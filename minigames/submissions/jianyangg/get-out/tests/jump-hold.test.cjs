const {test} = require('node:test');
const assert = require('node:assert/strict');
const {JumpHold} = require('../jump-hold.js');

test('releasing another finger does not cancel a held jump', () => {
  const held = new JumpHold();
  held.press('pointer:1');
  held.release('pointer:2');
  assert.equal(held.active, true);
  held.release('pointer:1');
  assert.equal(held.active, false);
});

test('keyboard and pointer holds are independent and reset clears both', () => {
  const held = new JumpHold();
  held.press('keyboard');held.press('pointer:1');held.release('pointer:1');
  assert.equal(held.active, true);
  held.clear();assert.equal(held.active, false);
});
