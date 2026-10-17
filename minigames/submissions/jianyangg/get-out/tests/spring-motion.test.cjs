const {test} = require('node:test');
const assert = require('node:assert/strict');
const {SpringMotion} = require('../spring-motion.js');
test('landing loads the plank, and takeoff bends then recoils before settling', () => {
  const spring = new SpringMotion();
  spring.land(0);assert.ok(spring.sample(70) > spring.sample(300));
  spring.launch(400);assert.ok(spring.sample(400) > 0);
  assert.ok(spring.sample(490) < 0);
  assert.equal(spring.sample(1000), 0);
});
test('walking off unloads the plank without a jump recoil', () => {
  const spring = new SpringMotion();spring.land(0);spring.leave(300);
  assert.ok(spring.sample(300) > 0);assert.equal(spring.sample(500), 0);
});
