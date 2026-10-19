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

test('stars shift before every direction, including blocked slides',()=>{
 for(const action of ['up','right','down','left']) {
  const s=game.create(['S*..','....','...E']);
  const next=game.step(s,action);
  assert.equal(next.board[0],'S.*.');
  assert.equal(next.moves,1);
  assert.equal(s.board[0],'S*..');
 }
 assert.deepEqual(game.step(game.create(['S.*.','....','...E']),'right').position,[0,2]);
});
test('stars stay at the edge, wait at obstacles, and never overwrite player or markers',()=>{
 assert.equal(game.step(game.create(['S...','...*','...E']),'up').board[1],'...*');
 for(const row of ['*#..','**..','*E..','*S..']) {
  const board=row.includes('S')?[row,'...E']:row.includes('E')?['S...',row]:['S...',row,'...E'];
  assert.equal(game.step(game.create(board),'up').board[board.indexOf(row)][0],'*');
 }
 const s=game.create(['.*S.','...E']);
 assert.deepEqual(game.step(s,'left'),s);
 const p=game.create(['S...','*...','...E']);
 const next=game.step(p,'right');
 assert.equal(next.board[1],'.*..');
 const occupied=game.create(['S...','.*..','...E']);
 occupied.position=[1,2];
 assert.equal(game.step(occupied,'left'),occupied);
 assert.throws(()=>game.step(p,'teleport'),/direction/i);
 assert.equal(p.board[1],'*...');
 const won=game.step(game.create(['SE..','*...']),'right');
 assert.equal(won.won,true);assert.equal(game.step(won,'down'),won);
});
test('solver plans with wall movement before the ball',()=>{
 const s=game.create(['S*.E','#...','....']);
 const solution=game.solve(s);
 assert.deepEqual(solution,['right','down','right','up']);
 assert.equal(solution.reduce((state,action)=>game.step(state,action),s).won,true);
});

test('solver limits are reported as unknown rather than unsolvable',()=>{
 assert.throws(()=>game.solve(game.create(['S*.E','#...','....']),1),/search limit/);
});

test('stars alternate between their placed tile and right neighbor without drifting',()=>{
 let s=game.create(['S....','.*...','....E']);
 const initial=s;
 for(const row of ['..*..','.*...','..*..','.*...']) {
  s=game.step(s,'up');assert.equal(s.board[1],row);
 }
 assert.equal(initial.board[1],'.*...');
 assert.equal(s.moves,4);
});

test('a returning wall waits for the player, then returns when its tile clears',()=>{
 const initial=game.create(['S....','.*...','....E']);
 const outward=game.step(initial,'up');
 const occupied={...outward,position:[1,1]};
 assert.equal(game.step(occupied,'right'),occupied);
 const departing=game.step(occupied,'up');
 assert.equal(departing.board[1],'..*..');
 const cleared=game.step(departing,'up');
 assert.equal(cleared.board[1],'.*...');
 const obs=game.observe(cleared);obs.movingWalls[0].home=99;obs.movingWalls[0].column=99;
 assert.equal(cleared.movingWalls[0].home,1);assert.equal(cleared.movingWalls[0].column,1);
 assert.equal(initial.movingWalls[0].column,1);
});

test('walls targeting the same empty tile both wait and remain distinct',()=>{
 const initial=game.create(['S...','**..','...E']);
 const outward=game.step(initial,'up');
 assert.equal(outward.board[1],'*.*.');
 const waiting=game.step(outward,'up');
 assert.equal(waiting,outward);
 assert.deepEqual(waiting.movingWalls.map(w=>w.column),[0,2]);
});

test('ball collides with the new wall position on both outward and returning turns',()=>{
 const initial=game.create(['S.*..','.....','....E']);
 const outward=game.step(initial,'right');
 assert.equal(outward.board[0],'S..*.');
 assert.deepEqual(outward.position,[0,2]);
 // Keep the ball at the start on turn one to test collision with the returning wall.
 const waited=game.step(initial,'up');
 assert.equal(waited.board[0],'S..*.');
 const returned=game.step(waited,'right');
 assert.equal(returned.board[0],'S.*..');
 assert.deepEqual(returned.position,[0,1]);
 assert.equal(returned.moves,2);
 assert.equal(initial.board[0],'S.*..');
});

test('every example includes multiple moving walls that can shift on its opening turn',()=>{
 for(const level of require('../levels.js')) {
  const initial=game.create(level.board);
  assert.ok(initial.movingWalls.length>=2,level.name);
  assert.ok(['up','right','down','left'].some(a=>game.step(initial,a).board.join('')!==initial.board.join('')),level.name);
 }
});
