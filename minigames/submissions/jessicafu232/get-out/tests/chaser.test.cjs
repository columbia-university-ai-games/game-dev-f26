const {test}=require('node:test');
const assert=require('node:assert/strict');
const g=require('../engine.js');
const board=['S....','.....','.....','....E'];
test('chaser starts away from player and moves exactly one cell per slide',()=>{
 const s=g.create(board); assert.ok(s.chaser); assert.notDeepEqual(s.chaser,s.position);
 const n=g.step(s,'right'); assert.equal(Math.abs(n.chaser[0]-s.chaser[0])+Math.abs(n.chaser[1]-s.chaser[1]),1);
 assert.equal(n.moves,1); assert.notEqual(n.chaser,s.chaser);
});
test('every third turn wanders instead of taking the closest step',()=>{
 const s={...g.create(board),position:[0,0],chaser:[2,2],moves:2};
 const n=g.step(s,'right'); assert.deepEqual(n.chaser,[3,2]);
});
test('blocked and unknown actions preserve chaser and phase',()=>{
 const s=g.create(board); assert.equal(g.step(s,'up'),s);assert.throws(()=>g.step(s,'bad'));
 assert.equal(s.moves,0);assert.ok(s.chaser);
});
test('catch ends play, exit takes priority, and observations are detached',()=>{
 const s={...g.create(board),chaser:[1,4]};const n=g.step(s,'right');assert.equal(n.caught,true);
 assert.equal(g.step(n,'down'),n);assert.deepEqual(g.legalActions(n),[]);assert.equal(g.solve(n),null);
 const win=g.step({...s,position:[3,0],chaser:[3,4]},'right');assert.equal(win.won,true);assert.equal(win.caught,false);
 const obs=g.observe(s);obs.chaser[0]=99;assert.deepEqual(s.chaser,[1,4]);
});
test('reset repeats pursuit, histories are immutable, and solver avoids capture',()=>{
 const s=g.create(board),path=g.solve(s);assert.ok(path);let current=s;
 for(const a of path){current=g.step(current,a);assert.equal(current.caught,false);}assert.equal(current.won,true);
 assert.deepEqual(g.create(board),s);assert.deepEqual(s.position,[0,0]);
});

test('landing on old chaser catches even when it walks away; sliding past it is safe',()=>{
 const s=g.create(board);
 const caught=g.step({...s,chaser:[0,4]},'right');assert.equal(caught.caught,true);assert.deepEqual(caught.position,[0,4]);
 const passed=g.step({...s,chaser:[0,2]},'right');assert.equal(passed.caught,false);assert.deepEqual(passed.position,[0,4]);
});
test('chaser cannot cross walls and no eligible spawn stays absent',()=>{
 const s=g.create(['S....','####.','....E']);const n=g.step({...s,chaser:[2,2]},'right');
 assert.deepEqual(n.chaser,[2,3]);
 const tiny=g.create(['SE','##']);assert.equal(tiny.chaser,null);assert.equal(g.step(tiny,'right').won,true);
});

test('chase maps have safe routes and Ring road punishes the unsafe first corner',()=>{
 const levels=require('../levels.js').filter(l=>l.name.startsWith('Chase:'));
 assert.equal(levels.length,3);
 for(const level of levels){
  const initial=g.create(level.board);assert.ok(initial.chaser,level.name);
  const path=g.solve(initial);assert.ok(path && path.length>0,level.name);
  let s=initial;for(const a of path){s=g.step(s,a);assert.equal(s.caught,false,level.name);}assert.equal(s.won,true,level.name);
 }
 const ring=g.create(levels.find(l=>l.name==='Chase: Ring road').board);
 assert.equal(g.step(g.step(ring,'right'),'down').caught,true);
 assert.equal(g.step(g.step(ring,'down'),'right').won,true);
});
