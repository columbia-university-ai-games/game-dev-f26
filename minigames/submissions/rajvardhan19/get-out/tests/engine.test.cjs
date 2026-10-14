const {test}=require('node:test');
const assert=require('node:assert/strict');
const game=require('../engine.js');
const board=['S..#.', '.....', '.#...', '...E.', '.....'];
test('slides to a wall or border, then swaps with the exit, without mutating the input',()=>{
 const s=game.create(board);const next=game.step(s,'right');
 // Slid to (0,2), missed the exit, so the ball continues from the old exit and the exit waits at (0,2).
 assert.deepEqual(next.position,[3,3]);assert.deepEqual(next.exit,[0,2]);assert.equal(next.moves,1);
 assert.deepEqual(s.position,[0,0]);assert.deepEqual(s.exit,[3,3]);assert.equal(s.moves,0);
 const down=game.step(s,'down');assert.deepEqual(down.position,[3,3]);assert.deepEqual(down.exit,[4,0]);
});
test('the next move is played from the exit side and swaps again',()=>{
 const s=game.step(game.create(board),'right');const next=game.step(s,'up');
 // From (3,3) the ball stops under the wall at (1,3); the exit at (0,2) is not crossed.
 assert.deepEqual(next.position,[0,2]);assert.deepEqual(next.exit,[1,3]);assert.equal(next.moves,2);
});
test('blocked and unknown actions do not spend moves or swap',()=>{
 const s=game.create(board);assert.deepEqual(game.step(s,'up'),s);
 assert.throws(()=>game.step(s,'teleport'),/direction/i);
 // After two swaps the ball is at (0,2) under the border and beside a wall.
 const swapped=['right','up'].reduce((s,a)=>game.step(s,a),s);
 assert.equal(game.step(swapped,'up'),swapped);assert.equal(game.step(swapped,'right'),swapped);
 assert.deepEqual(game.legalActions(swapped),['down','left']);
});
test('the original exit square is plain floor once the exit has moved',()=>{
 const s=['right','up','down','down'].reduce((s,a)=>game.step(s,a),game.create(board));
 // The last slide crosses the starting E square at (3,3) without winning.
 assert.equal(s.won,false);assert.deepEqual(s.position,[4,2]);assert.deepEqual(s.exit,[4,3]);assert.equal(s.moves,4);
});
test('reaching an exit mid-slide wins and terminal states cannot move',()=>{
 const s=game.create(['S.E..','.....','.....']);
 const won=game.step(s,'right');assert.deepEqual(won.position,[0,2]);assert.deepEqual(won.exit,[0,2]);
 assert.equal(won.won,true);assert.deepEqual(game.step(won,'down'),won);
});
test('solver plans across swaps and identifies unreachable exits',()=>{
 // Reference answer was right, down. After right the ball swaps into the corner exit and must go up.
 assert.deepEqual(game.solve(game.create(['S..','...','..E'])),['right','up']);
 // Unreachable under the reference rules; the swap makes the centre exit reachable in three moves.
 const centre=game.create(['S..','.E.','...']),path=game.solve(centre);
 assert.equal(path.length,3);assert.equal(path.reduce((s,a)=>game.step(s,a),centre).won,true);
 // A walled-in exit traps the ball after the first swap.
 assert.equal(game.solve(game.create(['S..','.##','.#E'])),null);
 // A walled-in start has no first move at all.
 assert.equal(game.solve(game.create(['S#.','#..','..E'])),null);
});
test('invalid imported boards fail before play',()=>{
 for(const b of [[],['S.E','..'],['SSE'],['S..'],['S?E'],['S.E',42],Array(21).fill('S.E')]){
  assert.throws(()=>game.create(b));
 }
});
test('observations are detached, show the moving exit, and legal actions follow actual movement',()=>{
 const s=game.create(board);assert.deepEqual(game.legalActions(s),['right','down']);
 const obs=game.observe(s);assert.deepEqual(obs.exit,[3,3]);assert.equal(obs.board[3],'...E.');
 obs.position[0]=99;obs.exit[0]=99;obs.board[0]='broken';
 assert.deepEqual(s.position,[0,0]);assert.deepEqual(s.exit,[3,3]);assert.equal(s.board[0],board[0]);
 // The observed board letters follow the moving exit, so no stale door is shown.
 const after=game.observe(game.step(s,'right'));assert.deepEqual(after.exit,[0,2]);
 assert.deepEqual(after.board,['S.E#.', '.....', '.#...', '.....', '.....']);
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
