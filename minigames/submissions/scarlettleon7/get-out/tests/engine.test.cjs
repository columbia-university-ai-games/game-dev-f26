const {test}=require('node:test');
const assert=require('node:assert/strict');
const game=require('../engine.js');
const board=['S..#.', '.....', '.#...', '...E.', '.....'];
test('slides to a wall or border without mutating the input',()=>{
 const s=game.create(board);const next=game.step(s,'right');
 assert.deepEqual(next.position,[1,2]);assert.equal(next.moves,1);
 assert.deepEqual(s.position,[0,0]);assert.equal(s.moves,0);
 assert.deepEqual(game.step(s,'down').position,[0,0]);
});
test('blocked and unknown actions do not spend moves',()=>{
 const s=game.create(board);assert.deepEqual(game.step(s,'up'),s);
 assert.throws(()=>game.step(s,'teleport'),/direction/i);
});
test('reaching an exit mid-slide wins and terminal states cannot move',()=>{
 const s=game.create(['S.E..','.....','.....']);
 const won=game.step(s,'right');assert.deepEqual(won.position,[1,2]);
 assert.equal(won.won,true);assert.deepEqual(game.step(won,'down'),won);
});
test('solver paths use the rotating board and detect unreachable exits',()=>{
 const s=game.create(['S..','...','..E']), path=game.solve(s);
 assert.ok(path);assert.equal(path.reduce((s,a)=>game.step(s,a),s).won,true);
 assert.equal(game.solve(game.create(['S#E','###','...'])),null);
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

test('successful slides rotate whole rows and carry the player without changing columns',()=>{
 const s=game.create(['S..#.', '.....', '.#...', '...E.', '.....']);
 const next=game.step(s,'right');
 assert.deepEqual(next.board,[s.board[4],...s.board.slice(0,-1)]);
 assert.deepEqual(next.position,[1,2]);
 assert.deepEqual(s.board,['S..#.', '.....', '.#...', '...E.', '.....']);
 const down=game.step(s,'down');assert.deepEqual(down.position,[0,0]);
 assert.equal(down.board[down.position[0]][down.position[1]],'.');
 assert.strictEqual(game.step(s,'up'),s);
});
test('winning rotation keeps the player on the exit',()=>{
 const won=game.step(game.create(['S.E','...']),'right');
 assert.equal(won.won,true);assert.equal(won.board[won.position[0]][won.position[1]],'E');
});
