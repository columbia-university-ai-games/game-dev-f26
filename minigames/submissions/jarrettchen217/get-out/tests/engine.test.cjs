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

// These tests catch missing collision consumption, input mutation, and position-only solver keys.
test('one-use wall stops this slide and becomes floor for the next',()=>{
 const initial=game.create(['S.F.E','#####']);
 const stopped=game.step(initial,'right');
 assert.deepEqual(stopped.position,[0,1]);assert.equal(stopped.board[0],'S...E');
 assert.equal(stopped.moves,1);assert.equal(stopped.won,false);
 assert.equal(initial.board[0],'S.F.E');assert.deepEqual(initial.position,[0,0]);
 const won=game.step(stopped,'right');assert.equal(won.won,true);assert.equal(won.moves,2);
});
test('adjacent one-use wall consumes one action without displacement',()=>{
 const s=game.create(['SF.E','####']);const next=game.step(s,'right');
 assert.deepEqual(next.position,[0,0]);assert.equal(next.board[0],'S..E');
 assert.equal(next.moves,1);assert.notEqual(next,s);
 assert.deepEqual(game.legalActions(s),['right']);
 assert.equal(game.step(s,'left'),s);assert.throws(()=>game.step(s,'teleport'),/direction/i);
 assert.equal(s.board[0],'SF.E');
});
test('solver can revisit a position after consuming a wall',()=>{
 const s=game.create(['SF.E','####']);
 assert.deepEqual(game.solve(s),['right','right']);
 const stopped=game.step(s,'right');assert.deepEqual(game.solve(stopped),['right']);
 assert.equal(game.solve(game.create(['S#E','###'])),null);
});
test('only the collided one-use wall changes and exits stop before later walls',()=>{
 const s=game.create(['S.F.F.E','#######']);const next=game.step(s,'right');
 assert.equal(next.board[0],'S...F.E');
 const won=game.step(game.create(['S.EF','####']),'right');
 assert.equal(won.won,true);assert.equal(won.board[0],'S.EF');
 assert.equal(game.step(won,'right'),won);
 const obs=game.observe(next);obs.board[0]='broken';assert.equal(next.board[0],'S...F.E');
});

test('experiment board requires the wall before and after consumption',()=>{
 const b=['S.###','.....','.##E.','...F.','#...#']; // Original experiment retained as a rule fixture.
 const initial=game.create(b);
 assert.deepEqual(game.solve(initial),['down','right','down','right','up']);
 assert.equal(game.solve(game.create(b.map(row=>row.replace('F','#')))),null);
 assert.equal(game.solve(game.create(b.map(row=>row.replace('F','.')))),null);
});

test('advanced boards are built in as puzzles six and seven and require both wall states',()=>{
 const levels=require('../levels.js');
 assert.ok(levels.length>=7);
 const expected=[
  ['down','right','up','right','up','left','up','left','down','right'],
  ['up','right','down','left','down','left','down','right','up','right']
 ];
 for(let i=0;i<2;i++){
  const board=levels[5+i].board;
  assert.equal(board.join('').split('F').length-1,1);
  assert.deepEqual(game.solve(game.create(board)),expected[i]);
  const won=expected[i].reduce((state,action)=>game.step(state,action),game.create(board));
  assert.equal(won.won,true);
  assert.equal(game.solve(game.create(board.map(row=>row.replace('F','#')))),null);
  assert.equal(game.solve(game.create(board.map(row=>row.replace('F','.')))),null);
 }
});

test('puzzle eight loses its solution if the wall is consumed from the starting row',()=>{
 const board=require('../levels.js')[7]?.board;
 assert.ok(board,'Puzzle eight is built in');
 const initial=game.create(board);
 assert.deepEqual(game.solve(initial),['up','right','down','left','down','right','down']);
 const lost=game.step(initial,'right');
 assert.deepEqual(lost.position,[1,2]);assert.equal(lost.board[1],'.S.....');
 assert.equal(lost.won,false);assert.equal(game.solve(lost),null);
 assert.equal(initial.board[1],'.S.F...');assert.ok(game.solve(initial));
});

test('puzzle nine has a delayed irreversible detour and a safe solution',()=>{
 const board=require('../levels.js')[8]?.board;assert.ok(board,'Puzzle nine is built in');
 const initial=game.create(board);
 const safe=['down','left','down','right','up','right','down','left','up'];
 assert.deepEqual(game.solve(initial),safe);
 assert.equal(safe.reduce((s,a)=>game.step(s,a),initial).won,true);
 const before=['right','up'].reduce((s,a)=>game.step(s,a),initial);
 assert.notEqual(game.solve(before),null);
 const lost=game.step(before,'down');
 assert.equal(lost.board[4],'...#...');assert.equal(lost.won,false);
 assert.equal(game.solve(lost),null);assert.equal(initial.board[4],'..F#...');
});

test('first five puzzles teach increasing wall counts with short working routes',()=>{
 const levels=require('../levels.js');
 const counts=[1,1,2,2,3];
 const routes=[['right','right'],['right','down'],['right','right','right'],['right','down','down','right'],['down','right','up','up','left','down','down','down']];
 for(let i=0;i<5;i++){
  const initial=game.create(levels[i].board);
  assert.equal(initial.board.join('').split('F').length-1,counts[i],`puzzle ${i+1}`);
  assert.deepEqual(game.solve(initial),routes[i],`puzzle ${i+1}`);
  const won=routes[i].reduce((s,a)=>game.step(s,a),initial);
  assert.equal(won.won,true);assert.equal(won.board.join('').includes('F'),false);
 }
});
test('first three teaching puzzles never trap a player after a legal move',()=>{
 for(const level of require('../levels.js').slice(0,3)){
  const initial=game.create(level.board),queue=[initial],seen=new Set();
  for(let i=0;i<queue.length;i++){
   const s=queue[i],key=s.position.join(',')+'|'+s.board.join('/');
   if(seen.has(key))continue;seen.add(key);
   assert.notEqual(game.solve(s),null,level.name);
   for(const action of game.legalActions(s))queue.push(game.step(s,action));
  }
 }
});
