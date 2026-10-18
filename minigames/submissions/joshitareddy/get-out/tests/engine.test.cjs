const {test}=require('node:test');
const assert=require('node:assert/strict');
const game=require('../engine.js');
const board=['S..#.', '.....', '.#...', '....E', '.....'];
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
test('observations are detached and directional actions reveal no hidden walls',()=>{
 const s=game.create(board);assert.deepEqual(game.legalActions(s),['up','right','down','left']);
 const obs=game.observe(s);obs.position[0]=99;obs.board[0]='broken';
 assert.deepEqual(s.position,[0,0]);assert.equal(s.board[0],board[0]);
});
test('every teaching board is solvable and its solution reaches the exit',()=>{
 const levels=require('../levels.js');
 for(const level of levels){
  for(let variation=0;variation<20;variation++){
   const initial=game.create(level.board),solution=game.solve(initial);
   assert.ok(solution && solution.length>0,`${level.name}, variation ${variation+1}`);
   const final=solution.reduce((s,a)=>{
    const checked=game.keepSolvable(game.step(s,a),initial);
    assert.equal(checked.reset,false,`${level.name}, variation ${variation+1}`);
    return checked.state;
   },initial);
   assert.equal(final.won,true,`${level.name}, variation ${variation+1}`);
  }
 }
});

test('breakable walls stay hidden until hit and take their assigned hits',()=>{
 const s=game.create(['S##E','....'],{random:()=>0.99});
 assert.deepEqual(game.observe(s).breakableWalls,[]);
 assert.equal(s.board[0],'S##E');
 const hit1=game.step(s,'right');
 assert.equal(hit1.moves,1);assert.equal(hit1.board[0],'S##E');
 assert.deepEqual(game.observe(hit1).breakableWalls,[{row:0,column:1,hitsRemaining:2}]);
 const hit2=game.step(hit1,'right'),broken=game.step(hit2,'right');
 assert.equal(broken.board[0],'S.#E');
 const besideSolid=game.step(broken,'right');
 assert.deepEqual(besideSolid.position,[0,1]);
 assert.strictEqual(game.step(besideSolid,'right'),besideSolid);
});

test('a requested hint reveals every breakable wall and remaining hits',()=>{
 const s=game.create(['S#E','...'],{random:()=>0});
 const revealed=game.revealBreakables(s),walls=game.observe(revealed).breakableWalls;
 assert.deepEqual(walls,[{row:0,column:1,hitsRemaining:1}]);
 assert.deepEqual(game.observe(s).breakableWalls,[]);
});

test('legal actions cannot identify which identical wall is breakable',()=>{
 const first=game.create(['S##E','....'],{random:()=>0.99});
 const second=game.create(['S##E','....'],{random:()=>0});
 assert.deepEqual(game.observe(first),game.observe(second));
});

test('solver includes repeated wall hits when breaking is required',()=>{
 const initial=game.create(['S..','###','.E.'],{random:()=>0.99});
 const solution=game.solve(initial);
 assert.ok(solution && solution.length>0);
 const final=solution.reduce((s,a)=>game.step(s,a),initial);
 assert.equal(final.won,true);
});

test('generation rejects a random layout when no solvable fallback exists',()=>{
 assert.throws(()=>game.create(['S#.#E','#####'],{random:()=>0}),/No solvable breakable-wall layout/);
});

test('authored breakable cells stay hidden and use their configured hit range',()=>{
 const board=['S#E','...'],breakableWalls=[{row:0,column:1,minHits:2,maxHits:3}];
 const low=game.create(board,{breakableWalls,random:()=>0});
 const high=game.create(board,{breakableWalls,random:()=>0.999});
 assert.deepEqual(game.observe(low).breakableWalls,[]);
 assert.equal(game.step(low,'right').lastHit.hitsRemaining,1);
 assert.equal(game.step(high,'right').lastHit.hitsRemaining,2);
});

test('invalid authored breakable configurations are refused',()=>{
 const board=['S#E','...'];
 const invalid=[[],[{row:0,column:0}], [{row:9,column:1}],
  [{row:0,column:1},{row:0,column:1}], [{row:0,column:1,minHits:0,maxHits:2}],
  [{row:0,column:1,minHits:3,maxHits:2}], [{row:0,column:1,minHits:1,maxHits:4}]];
 for(const breakableWalls of invalid){
  assert.throws(()=>game.create(board,{breakableWalls}),/authored breakable wall/i);
 }
});

test('advanced levels require breaking, preserving, then combining both ideas',()=>{
 const levels=require('../levels.js'),advanced=levels.slice(4);
 assert.deepEqual(advanced.map(level=>level.lesson),['break','preserve','combine']);
 for(const random of [()=>0,()=>0.999]){
  const lengths=advanced.map(level=>game.solve(game.create(level.board,{breakableWalls:level.breakableWalls,random})).length);
  assert.ok(lengths[0]<lengths[1]&&lengths[1]<lengths[2],`difficulty sequence ${lengths}`);
 }
 for(const level of advanced){
  for(const random of [()=>0,()=>0.999]){
   const initial=game.create(level.board,{breakableWalls:level.breakableWalls,random});
   const solution=game.solve(initial);
   assert.ok(solution,level.name);
   const final=solution.reduce((state,action)=>game.step(state,action),initial);
   assert.equal(final.won,true,level.name);
   if(level.mustBreak){
    const key=level.mustBreak.join(',');
    assert.equal(final.breakables[key].remaining,0,`${level.name} must break ${key}`);
    assert.equal(game.solve({...initial,breakables:{}}),null,`${level.name} has no solid-wall route`);
   }
   if(level.mustPreserve){
    const [row,column]=level.mustPreserve,key=level.mustPreserve.join(',');
    const board=initial.board.slice();board[row]=board[row].slice(0,column)+'.'+board[row].slice(column+1);
    const broken={...initial,board,breakables:{...initial.breakables,[key]:{remaining:0,revealed:true}}};
    assert.equal(game.solve(broken),null,`${level.name} needs ${key} as a stopping wall`);
    assert.ok(final.breakables[key].remaining>0,`${level.name} solution preserves ${key}`);
   }
  }
 }
});

test('an unsolvable move resets the attempt to its initial solvable state',()=>{
 const level=require('../levels.js')[5];
 const initial=game.create(level.board,{breakableWalls:level.breakableWalls,random:()=>0});
 const before=['right','down','right','right'].reduce((state,action)=>game.step(state,action),initial);
 assert.notEqual(game.solve(before),null);
 const stranded=game.step(before,'right');
 assert.equal(game.solve(stranded),null);
 assert.deepEqual(game.keepSolvable(stranded,initial),{state:initial,reset:true});
 assert.deepEqual(game.keepSolvable(game.step(initial,'right'),initial),
  {state:game.step(initial,'right'),reset:false});
});
