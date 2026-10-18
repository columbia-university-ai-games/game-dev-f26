const {test}=require('node:test');
const assert=require('node:assert/strict');
const game=require('../engine.js');
const board=['S..#.', '.....', '.#...', '...E.', '.....'];
test('slides to a wall or border without mutating the input',()=>{
 const s=game.create(board);const next=game.step(s,'right');
 assert.deepEqual(next.position,[0,2]);assert.equal(next.moves,1);
 assert.deepEqual(s.position,[0,0]);assert.equal(s.moves,0);
 assert.deepEqual(game.step(s,'down').position,[4,0]);
});
test('blocked and unknown actions do not spend moves',()=>{
 const s=game.create(board);assert.deepEqual(game.step(s,'up'),s);
 assert.throws(()=>game.step(s,'teleport'),/direction/i);
});
test('reaching an exit mid-slide wins and terminal states cannot move',()=>{
 const s=game.create(['S.E..','.....','.....']);
 const won=game.step(s,'right');assert.deepEqual(won.position,[0,2]);
 assert.equal(won.won,true);assert.deepEqual(game.step(won,'down'),won);
});
test('solver finds the hand-checked shortest path and identifies unreachable exits',()=>{
 assert.deepEqual(game.solve(game.create(['S..','...','..E'])),['right','down']);
 assert.equal(game.solve(game.create(['S..','.E.','...'])),null);
});
test('invalid imported boards fail before play',()=>{
 for(const b of [[],['S.E','..'],['SSE'],['S..'],['S?E'],['S.E',42],Array(21).fill('S.E')]){
  assert.throws(()=>game.create(b));
 }
});
test('observations are detached and legal actions follow actual movement',()=>{
 const s=game.create(board);assert.deepEqual(game.legalActions(s),['right','down']);
 const obs=game.observe(s);obs.position[0]=99;obs.board[0]='broken';
 assert.deepEqual(s.position,[0,0]);assert.equal(s.board[0],board[0]);
});
test('every teaching board is solvable and its solution reaches the exit',()=>{
 const levels=require('../levels.js');
 for(const level of levels){
  const initial=game.create(level.board),solution=game.solve(initial);
  assert.ok(solution && solution.length>0,level.name);
  const final=solution.reduce((s,a)=>game.step(s,a),initial);
  assert.equal(final.won,true,level.name);
 }
});
// Drifting-walls variation: after each successful move, two random walls each move one square.
const drifting=['S..#...','...#...','.......','..##E..','#......','.....##','#....#.'];
const near=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])<=1;
test('exactly two walls move one square each, never onto the player, start, exit, or another wall',()=>{
 let movedTwo=0;
 for(let seed=1;seed<=200;seed++){
  const s=game.create(drifting,seed),next=game.step(s,'down');
  assert.equal(next.walls.length,s.walls.length);
  assert.equal(new Set(next.walls.map(w=>w.join())).size,next.walls.length);
  const moved=next.walls.filter((w,i)=>w.join()!==s.walls[i].join());
  assert.ok(moved.length===2||moved.length===0,`seed ${seed}`);if(moved.length===2)movedTwo++;
  next.walls.forEach((w,i)=>{
   assert.ok(near(w,s.walls[i]),`seed ${seed}`);
   assert.notDeepEqual(w,next.position);assert.notDeepEqual(w,[0,0]);assert.notDeepEqual(w,[3,4]);
   assert.equal(next.board[w[0]][w[1]],'#');
  });
  assert.equal(next.board.join('').split('#').length-1,next.walls.length);
 }
 assert.ok(movedTwo>=190,`two walls moved on only ${movedTwo} of 200 seeds`);
});
test('boards with zero or one wall still play, and a lone wall moves every turn',()=>{
 const none=game.create(['S....','.....','....E'],4);
 assert.deepEqual(game.step(none,'right').walls,[]);
 const one=game.create(['S....','..#..','....E'],4),next=game.step(one,'right');
 assert.equal(next.walls.length,1);assert.ok(near(next.walls[0],[1,2]));
 assert.notDeepEqual(next.walls[0],[1,2]);
});
test('crowded boards still drift: walls with nowhere to go are skipped, not the whole turn',()=>{
 // Most walls here are boxed in by other walls; only a few have a free neighbour.
 const crowded=['S####','.####','.##..','....E'];
 let drifted=0;
 for(let seed=1;seed<=50;seed++){
  const s=game.create(crowded,seed),next=game.step(s,'down');
  const moved=next.walls.filter((w,i)=>w.join()!==s.walls[i].join()).length;
  assert.ok(moved<=2);if(moved>0)drifted++;
 }
 assert.ok(drifted>=45,`walls drifted on only ${drifted} of 50 seeds`);
});
test('hint falls back to the frozen-wall route, marked inexact, when the search cap is hit',()=>{
 const s=game.create(drifting,11),h=game.hint(s,1);
 assert.equal(h.exact,false);assert.deepEqual(h.path,game.solveStatic(s));
 assert.equal(game.hint(s).exact,true);
});
test('the same seed gives the same walls, and different seeds can differ',()=>{
 const a=game.step(game.create(drifting,7),'down'),b=game.step(game.create(drifting,7),'down');
 assert.deepEqual(a.walls,b.walls);
 const layouts=new Set();for(let seed=1;seed<=20;seed++)layouts.add(game.step(game.create(drifting,seed),'down').board.join());
 assert.ok(layouts.size>1);
});
test('blocked moves and escaping moves leave the walls in place',()=>{
 const s=game.create(drifting,3);assert.equal(game.step(s,'up'),s);
 const t=game.create(['S.E..','.#...','.....'],3),escaped=game.step(t,'right');
 assert.equal(escaped.won,true);assert.deepEqual(escaped.walls,t.walls);
});
test('a route to the exit always remains after the walls drift',()=>{
 for(let seed=1;seed<=100;seed++){
  let s=game.create(drifting,seed);
  for(const action of ['down','right','up','left','down','right']){
   s=game.step(s,action);if(s.won)break;
   assert.notEqual(game.solveStatic(s),null,`seed ${seed}`);
  }
 }
});
test('hints follow the actual drift: replaying the hinted route escapes',()=>{
 const levels=require('../levels.js');
 for(const level of levels)for(let seed=1;seed<=25;seed++){
  const s=game.create(level.board,seed),path=game.solve(s);
  assert.equal(path.reduce((x,a)=>game.step(x,a),s).won,true,`${level.name} seed ${seed}`);
 }
});
test('step does not mutate the input state or its walls',()=>{
 const s=game.create(drifting,5),before=JSON.stringify(s);game.step(s,'down');
 assert.equal(JSON.stringify(s),before);
});
