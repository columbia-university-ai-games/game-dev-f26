const {test}=require('node:test');
const assert=require('node:assert/strict');
const g=require('../engine.js');
const room=['#######','#.....#','#..E..#','#S....#','#######'];
function settle(s,held=false){for(let i=0;i<50&&!s.grounded&&!s.won&&!s.dead;i++)s=g.tick(s,held);return s;}
test('grounded movement sets gravity; airborne parallel input cannot rotate it',()=>{
 const s=g.create(room);assert.equal(s.grounded,true);
 const flying=g.input(s,'right');assert.equal(flying.gravity,'right');
 assert.equal(g.input(flying,'up').gravity,'right');
 assert.deepEqual(g.input(flying,'left'),flying);
 assert.deepEqual(s.position,[3,1]);
});
test('one successful sideways cell per flight, with rotated local controls',()=>{
 let s=g.input(g.create(room),'up');s=g.input(s,'steer-right');
 assert.deepEqual(s.position,[3,1]); // local right faces the left wall: blocked, not spent
 s=g.input(s,'steer-left');assert.deepEqual(s.position,[3,2]);
 assert.deepEqual(g.input(s,'steer-left'),s);
});
test('jump is grounded-only; held jump and trampoline extend height',()=>{
 const board=['########','#.....E#','#......#','#......#','#S.....#','########'];
 let short=g.tick(g.input(g.create(board),'jump'));
 assert.deepEqual(short.position,[3,1]);assert.equal(short.rise,0);
 assert.deepEqual(g.input(short,'jump'),short);
 let held=g.tick(g.tick(g.input(g.create(board),'jump'),true),true);
 assert.deepEqual(held.position,[2,1]);
 const bounce=board.slice();bounce[5]='#T######';
 const s=g.tick(g.tick(g.tick(g.input(g.create(bounce),'jump'),true),true),true);
 assert.deepEqual(s.position,[1,1]);
});
test('spike damage resets the level without restoring health',()=>{
 const s=g.create(['#####','#S^E#','#####']);
 const hit=g.tick(g.input(s,'right'));
 assert.equal(hit.health,12);assert.deepEqual(hit.position,[1,1]);assert.equal(hit.gravity,'down');
});
test('lava is solid and rebounds instead of becoming a standing surface',()=>{
 let s=g.input(g.create(['#######','#....E#','#S.~..#','#######']),'right');
 s=g.tick(s);s=g.tick(s);
 assert.deepEqual(s.position,[2,2]);assert.equal(s.health,14);assert.equal(s.grounded,false);
 assert.equal(g.tick(s).health,14);assert.equal(g.tick(s).bounceTicks,1);
});
test('dead or complete states reject movement; invalid boards are rejected',()=>{
 let s=g.create(['#####','#S^E#','#####'],3);s=g.tick(g.input(s,'right'));
 assert.equal(s.dead,true);assert.deepEqual(g.input(s,'down'),s);
 for(const b of [[],['S.E','..'],['SSE'],['S?E']])assert.throws(()=>g.create(b));
});
test('observation is detached and no unavailable actions are exposed',()=>{
 const s=g.create(room),obs=g.observe(s);obs.position[0]=99;obs.board[0]='broken';
 assert.equal(s.position[0],3);assert.equal(s.board[0],room[0]);
 assert.ok(obs.legalActions.includes('jump'));
 assert.ok(!g.observe(g.input(s,'up')).legalActions.includes('jump'));
});
test('holding Space during a gravity fall cannot create a jump',()=>{
 const s=g.input(g.create(room),'up');
 assert.deepEqual(g.tick(s,true).position,[2,1]);
 assert.equal(g.tick(s,true).rise,0);
});
test('lava recontacts after rebounds, and zero health is terminal',()=>{
 let s=g.input(g.create(['#######','#....E#','#S.~..#','#######'],2),'right');
 s=g.tick(g.tick(s));assert.equal(s.health,1);
 for(let i=0;i<3;i++)s=g.tick(s);
 assert.equal(s.health,0);assert.equal(s.dead,true);assert.deepEqual(g.tick(s),s);
});
test('exit reached by a sideways action wins immediately',()=>{
 let s=g.input(g.create(['#####','#...#','#.E.#','#S..#','#####']),'up');
 s=g.tick(s);s=g.input(s,'steer-left');assert.equal(s.won,true);
 assert.deepEqual(g.input(s,'jump'),s);
});
test('landing replenishes the steering allowance and a ceiling cancels ascent',()=>{
 let s=g.input(g.create(room),'jump');s=g.input(s,'steer-right');s=settle(s);
 assert.equal(s.grounded,true);s=g.input(s,'jump');assert.equal(s.steered,false);
 const low=g.input(g.create(['#####','#S.E#','#####']),'jump');
 const hit=g.tick(low,true);assert.equal(hit.rise,0);assert.equal(hit.extended,true);
 assert.equal(g.tick(hit,true).grounded,true);
});
test('a sideways hazard collision never enters the block',()=>{
 const board=['#######','#....E#','#S~^..#','#.....#','#######'];
 let s=g.create(board);s=g.input(s,'steer-right');
 assert.deepEqual(s.position,[2,1]);assert.equal(s.health,14);
 assert.equal(s.steered,false);
});
