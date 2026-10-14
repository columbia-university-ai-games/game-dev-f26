const {test}=require('node:test');
const assert=require('node:assert/strict');
const game=require('../engine.js');
const board=['S....','.....','..E..','.....','.....'];
const play=(s,actions)=>actions.reduce((state,action)=>game.step(state,action),s);

test('each successful slide records every crossed tile, without changing old states',()=>{
 const s=game.create(board,{spawnMoves:3,tilesPerSecond:1});
 const next=game.step(s,'right');
 assert.deepEqual(next.trail,[[0,0],[0,1],[0,2],[0,3],[0,4]]);
 assert.deepEqual(s.trail,[[0,0]]);
 assert.strictEqual(game.step(s,'up'),s);
 assert.strictEqual(game.advanceTime(next,10000),next);
});

test('curriculum spawns after exactly 3, 2, then 1 successful moves',()=>{
 for(const spawnMoves of [3,2,1]){
  let s=game.create(board,{spawnMoves,tilesPerSecond:1});
  for(let i=0;i<spawnMoves;i++){
   assert.equal(s.enemy.active,false);
   s=game.step(s,['right','down','left'][i]);
  }
  assert.equal(s.enemy.active,true);
  assert.deepEqual(game.enemyPosition(s),[0,0]);
  assert.equal(s.enemy.elapsedMs,0);
 }
});

test('real-time enemy follows corners in chronological trace rather than taking shortcuts',()=>{
 let s=play(game.create(board,{spawnMoves:3,tilesPerSecond:1}),['right','down','left']);
 const old=JSON.stringify(s);
 s=game.advanceTime(s,5000);
 assert.deepEqual(game.enemyPosition(s),[1,4]);
 assert.equal(s.moves,3);
 assert.equal(s.caught,false);
 assert.equal(JSON.parse(old).enemy.index,0);
});

test('fractional elapsed time accumulates and speed controls tiles per second',()=>{
 const s=game.step(game.create(board,{spawnMoves:1,tilesPerSecond:2}),'right');
 const half=game.advanceTime(s,250);
 assert.deepEqual(game.enemyPosition(half),[0,0]);
 assert.deepEqual(game.enemyPosition(game.advanceTime(half,250)),[0,1]);
 assert.equal(s.enemy.elapsedMs,0);
});

test('waiting is dangerous even without another player move, and capture is terminal',()=>{
 const s=game.step(game.create(board,{spawnMoves:1,tilesPerSecond:1}),'right');
 const caught=game.advanceTime(s,100000);
 assert.equal(caught.caught,true);
 assert.deepEqual(game.enemyPosition(caught),caught.position);
 assert.equal(caught.enemy.index,4);
 assert.equal(caught.moves,1);
 assert.deepEqual(game.legalActions(caught),[]);
 assert.equal(game.solve(caught),null);
 assert.strictEqual(game.step(caught,'down'),caught);
 assert.strictEqual(game.advanceTime(caught,5000),caught);
});

test('sliding through the enemy captures mid-slide, without tunneling past it',()=>{
 let s=game.step(game.create(board,{spawnMoves:1,tilesPerSecond:1}),'right');
 s=game.advanceTime(s,1000);
 const caught=game.step(s,'left');
 assert.deepEqual(caught.position,[0,1]);
 assert.equal(caught.caught,true);
 assert.equal(caught.moves,2);
 assert.deepEqual(caught.trail.at(-1),[0,1]);
});

test('winning at the spawn threshold stops the chase, and a fresh reset clears it',()=>{
 const initial=game.create(['S.E..','.....'],{spawnMoves:1,tilesPerSecond:1});
 const won=game.step(initial,'right');
 assert.equal(won.won,true);
 assert.equal(won.enemy.active,false);
 assert.strictEqual(game.advanceTime(won,5000),won);
 const reset=game.create(board,{spawnMoves:1,tilesPerSecond:1});
 assert.deepEqual(reset.trail,[[0,0]]);
 assert.equal(reset.enemy.active,false);
 assert.equal(reset.caught,false);
});

test('observations detach enemy, difficulty, and trace information',()=>{
 const s=game.step(game.create(board,{spawnMoves:1,tilesPerSecond:1}),'right');
 const obs=game.observe(s);
 assert.equal(obs.enemy.elapsedMs,undefined,'internal fractional timer is outside the visible observation');
 obs.trail[0][0]=99;obs.enemy.index=99;obs.enemy.position[0]=99;obs.difficulty.spawnMoves=99;
 assert.deepEqual(s.trail[0],[0,0]);assert.equal(s.enemy.index,0);
 assert.equal(s.difficulty.spawnMoves,1);
});

test('hint routes respect the current enemy tile and never propose a captured route',()=>{
 let s=game.step(game.create(['S....','.....','....E'],{spawnMoves:1,tilesPerSecond:1}),'right');
 s=game.advanceTime(s,1000);
 const path=game.solve(s);
 assert.deepEqual(path,['down']);
 const won=play(s,path);
 assert.equal(won.won,true);assert.equal(won.caught,false);
});

test('invalid chase settings and elapsed times fail explicitly',()=>{
 for(const config of [{spawnMoves:0,tilesPerSecond:1},{spawnMoves:1.5,tilesPerSecond:1},{spawnMoves:1,tilesPerSecond:0},{spawnMoves:1,tilesPerSecond:Infinity}]){
  assert.throws(()=>game.create(board,config));
 }
 for(const time of [-1,NaN,Infinity]) assert.throws(()=>game.advanceTime(game.create(board),time));
});

test('every curriculum board has a safe immediate route under its configured spawn rule',()=>{
 const levels=require('../levels.js');
 assert.deepEqual(levels.map(l=>l.difficulty.spawnMoves),[3,2,1,1]);
 assert.deepEqual(levels.map(l=>l.difficulty.tilesPerSecond),[2,3,4,5]);
 for(const level of levels){
  const s=game.create(level.board,level.difficulty),path=game.solve(s);
  assert.ok(path && path.length,level.name);
  const final=play(s,path);
  assert.equal(final.won,true,level.name);assert.equal(final.caught,false,level.name);
 }
});

test('doubled curriculum advances two trail tiles in each former one-tile interval',()=>{
 const levels=require('../levels.js'),formerIntervals=[1000,1000/1.5,500,400];
 assert.equal(game.create(board).difficulty.tilesPerSecond,2);
 for(const [i,level] of levels.entries()){
  const s=play(game.create(board,level.difficulty),['right','down','left']);
  assert.equal(s.enemy.active,true);
  const halfway=game.advanceTime(s,formerIntervals[i]/2);
  assert.equal(halfway.enemy.index,1,level.name+' at half the former interval');
  const full=game.advanceTime(s,formerIntervals[i]);
  assert.equal(full.enemy.index,2,level.name+' at the former interval');
  assert.equal(full.caught,false);
 }
});
