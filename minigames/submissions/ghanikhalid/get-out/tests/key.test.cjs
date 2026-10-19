const {test}=require('node:test');
const assert=require('node:assert/strict');
const g=require('../engine.js');
test('key stops slide, locks exit, then seals return route',()=>{
 const s=g.create(['SE.K','....','....']);
 assert.equal(g.step(s,'right'),s);
 const a=g.step(g.step(g.step(s,'down'),'right'),'up');
 assert.deepEqual(a.position,[0,3]);assert.equal(a.hasKey,true);assert.equal(a.won,false);
 const b=g.step(a,'left');assert.equal(b.won,true);
 assert.equal(g.step(a,'down'),a);
 const k=g.step(g.create(['SK..','....','...E']),'right');
 assert.deepEqual(g.step(g.step(k,'right'),'left').position,[0,2]);
 assert.equal(s.hasKey,false);assert.equal(g.observe(a).hasKey,true);
 assert.equal(g.solve(s).reduce((s,a)=>g.step(s,a),s).won,true);
});
test('cannot reverse the collecting slide immediately',()=>{
 const s=g.create(['SK..','....','...E']);
 const keyed=g.step(s,'right');
 assert.equal(g.step(keyed,'left'),keyed);
});
