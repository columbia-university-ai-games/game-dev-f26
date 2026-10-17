const {test} = require('node:test');
const assert = require('node:assert/strict');
const {DamageReaction} = require('../damage-reaction.js');
const snapshot = {board:['S..','..E'],position:[0,1],gravity:'right'};
test('spike pose stays at the impact until the death reaction finishes', () => {
  const reaction = new DamageReaction();
  reaction.begin({kind:'spike',position:[0,1],gravity:'right',normal:[0,-1]},snapshot,{time:100});
  const pose=reaction.sample(200);
  assert.equal(pose.kind,'spike');assert.equal(pose.eyes,'××');assert.equal(pose.freeze,true);
  assert.deepEqual(pose.snapshot.position,[0,1]);
  assert.equal(reaction.sample(600),null);
});
test('lava shakes and rebounds away from the touched face without freezing play', () => {
  const reaction = new DamageReaction();
  reaction.begin({kind:'lava',position:[0,1],gravity:'right',normal:[0,-1]},snapshot,{time:0});
  const pose=reaction.sample(77);
  assert.equal(pose.kind,'lava');assert.equal(pose.freeze,false);
  assert.ok(pose.offset[1]<0);assert.ok(pose.offset[0]!==0);
  assert.equal(reaction.sample(300),null);
});
test('reduced motion retains damage identity without shaking or bouncing', () => {
  const reaction = new DamageReaction(true);
  reaction.begin({kind:'lava',position:[0,1],gravity:'right',normal:[0,-1]},snapshot,{time:0});
  assert.deepEqual(reaction.sample(77).offset,[0,0]);
  reaction.clear();assert.equal(reaction.sample(80),null);
});
