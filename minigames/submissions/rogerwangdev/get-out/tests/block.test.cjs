const {test}=require('node:test');const assert=require('node:assert/strict');const g=require('../engine.js');
test('slide stops before block and pushes it one square without mutating input',()=>{
 const s=g.create(['S.B..','....E']);const n=g.step(s,'right');
 assert.deepEqual(n.position,[0,1]);assert.deepEqual(n.block,[0,3]);assert.deepEqual(s.block,[0,2]);assert.equal(n.moves,1);
});
test('adjacent push spends a move; blocked block cannot move',()=>{
 const s=g.create(['SB..','...E']);const n=g.step(s,'right');assert.deepEqual(n.position,[0,0]);assert.deepEqual(n.block,[0,2]);assert.equal(n.moves,1);
 const stuck=g.create(['SB#','..E']);assert.equal(g.step(stuck,'right'),stuck);
 const obs=g.observe(s);obs.block[0]=99;assert.deepEqual(s.block,[0,1]);
});
test('all four puzzles contain one block and shortest solutions actually push it',()=>{
 const levels=require('../levels.js');assert.equal(levels.length,4);
 for(const l of levels){const s=g.create(l.board);assert.ok(s.block,l.name);const path=g.solve(s);assert.ok(path,l.name);let current=s,pushed=false;
 for(const a of path){const n=g.step(current,a);pushed ||= n.block.join(',')!==current.block.join(',');current=n;}
 assert.equal(g.solve(g.create(l.board.map(row=>row.replace('B','#')))),null, l.name+' requires moving block');assert.ok(pushed,l.name);assert.equal(current.won,true,l.name);}
});

test('block may cover exit, moving it does not erase exit; multiple blocks rejected',()=>{
 const s=g.create(['SBE','...']);const n=g.step(s,'right');assert.deepEqual(n.block,[0,2]);assert.equal(n.board[0][2],'E');assert.equal(n.won,false);
 assert.throws(()=>g.create(['SBB','..E']),/at most one/);
});
