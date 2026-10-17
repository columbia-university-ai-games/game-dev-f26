const {test}=require('node:test');
const assert=require('node:assert/strict');
const game=require('../engine.js');
// Thin ice: every square the player starts on or slides over cracks.
// Entering a cracked square again drops the player and restarts the attempt.
test('the start square and every square slid over become cracked',()=>{
 const s=game.create(['S...#','.....','....E']);
 assert.deepEqual(s.cracked,['0,0']);
 const next=game.step(s,'right');
 assert.deepEqual(next.position,[0,3]);
 assert.deepEqual(next.cracked,['0,0','0,1','0,2','0,3']);
 assert.deepEqual(s.cracked,['0,0']);
});
test('sliding onto a cracked square falls and resets to the start',()=>{
 const s=game.create(['S..#','....','...E']);
 const across=game.step(s,'right');
 const fell=game.step(across,'left');
 assert.deepEqual(fell.position,[0,0]);
 assert.equal(fell.moves,0);
 assert.deepEqual(fell.cracked,['0,0']);
 assert.equal(fell.falls,1);
 assert.deepEqual(fell.fell,{action:'left',from:[0,2],at:[0,1]});
 assert.equal(fell.won,false);
});
test('passing over a cracked square mid-slide also falls',()=>{
 const s=game.create(['..S.','....','.E#.','....']);
 let t=s;
 for(const a of ['down','right','down','left','up'])t=game.step(t,a);
 assert.deepEqual(t.position,[0,0]);assert.equal(t.falls,0);
 const fell=game.step(t,'right');   // (0,1) is fresh, (0,2) is the cracked start
 assert.equal(fell.falls,1);assert.deepEqual(fell.fell.at,[0,2]);
 assert.deepEqual(fell.position,[0,2]);
});
test('a fresh move after a fall clears the fall marker but keeps the count',()=>{
 const s=game.create(['S..#','....','...E']);
 const fell=game.step(game.step(s,'right'),'left');
 const next=game.step(fell,'down');
 assert.equal(next.fell,null);assert.equal(next.falls,1);
});
test('falling moves are legal but the solver never uses them',()=>{
 const s=game.step(game.create(['S..#','....','...E']),'right');
 assert.ok(game.legalActions(s).includes('left'));
 const path=game.solve(s);
 assert.deepEqual(path,['down','right']);
 const final=path.reduce((x,a)=>game.step(x,a),s);
 assert.equal(final.won,true);assert.equal(final.falls,0);
});
test('a board solvable by revisiting squares is unsolvable on thin ice',()=>{
 // Reference rules: up, right, down, left, up. On thin ice the left slide
 // recrosses (1,2), which cracked on the first move, so no safe route exists.
 const s=game.create(['E#..','....','##S#','#..#']);
 let t=s;for(const a of ['up','right','down'])t=game.step(t,a);
 assert.equal(game.step(t,'left').falls,1);
 assert.equal(game.solve(s),null);
});
test('observations include cracked squares and falls, detached from state',()=>{
 const s=game.create(['S..','...','..E']);
 const obs=game.observe(s);
 assert.deepEqual(obs.cracked,['0,0']);assert.equal(obs.falls,0);
 obs.cracked.push('9,9');
 assert.deepEqual(s.cracked,['0,0']);
});
test('on the new teaching boards, the reference shortest route falls through',()=>{
 const levels=require('../levels.js');
 // Shortest routes under the reference rules (no thin ice), checked by its solver.
 const reference={'Cracks behind you':['left','down','right','up'],'No way back':['up','right','down','left']};
 for(const [name,route] of Object.entries(reference)){
  const level=levels.find(l=>l.name===name);let s=game.create(level.board);
  for(const a of route){s=game.step(s,a);if(s.fell)break;}
  assert.equal(s.falls,1,name);
  assert.ok(game.solve(game.create(level.board)).length>route.length,name);
 }
});
