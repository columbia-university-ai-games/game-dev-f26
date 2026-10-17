const {test}=require('node:test');const assert=require('node:assert/strict');
const c=require('../campaign.js'),g=require('../engine.js'),solver=require('../solver.js'),levels=require('../levels.js');
test('health carries between levels and reset cannot replenish it',()=>{
 const boards=[{board:['#######','#....E#','#S.~..#','#######']},{board:['#####','#S.E#','#####']}];
 let run=c.create(boards);run=c.input(run,'right');run=c.tick(c.tick(run));
 assert.equal(run.state.health,14);run=c.input(run,'up');
 for(let i=0;i<10&&!run.state.won;i++)run=c.tick(run);
 assert.equal(run.state.won,true);run=c.next(run);assert.equal(run.state.health,14);
 assert.equal(c.reset(run).state.health,14);
});
test('five spike contacts exhaust five hearts and restart level one',()=>{
 const boards=[{board:['#####','#S.E#','#####']},{board:['#####','#S^E#','#####']}];
 let run=c.create(boards);run=c.tick(c.tick(c.input(run,'right')));run=c.next(run);
 for(let i=0;i<5;i++)run=c.tick(c.input(run,'right'));
 assert.equal(run.index,0);assert.equal(run.state.health,15);assert.equal(run.restarts,1);
});
test('all current boards have a damage-free solution under the new physics',()=>{
 for(const level of levels){
  const route=solver.solve(level.board);assert.ok(route,level.name);
  let s=g.create(level.board);for(const a of route)s=a==='tick'||a==='hold'?g.tick(s,a==='hold'):g.input(s,a);
  assert.equal(s.won,true,level.name);assert.equal(s.health,15);
 }
});
test('a trampoline supports a held trampoline jump and sideways exit',()=>{
 let s=g.input(g.create(['#########','#.^.....#','#..E....#','#.......#','#.......#','#.S..~^.#','##T######']),'jump');
 for(let i=0;i<3;i++)s=g.tick(s,true);
 assert.deepEqual(s.position,[2,2]);s=g.input(s,'steer-right');assert.equal(s.won,true);
});
