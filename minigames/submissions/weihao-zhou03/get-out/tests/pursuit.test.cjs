const {test}=require('node:test');
const assert=require('node:assert/strict');
const game=require('../engine.js');
const code=require('../puzzle-code.js');
const open=['S....','.....','....E','.....','.....'];

test('one accepted Wait gives the monster exactly one shortest-path step, with visible tie order',()=>{
  const initial=game.create(open,{monster:[2,2]});
  const next=game.step(initial,'wait');
  assert.deepEqual(next.position,[0,0]);
  assert.deepEqual(next.monster,[1,2]);
  assert.equal(next.moves,1);
  assert.deepEqual(initial.monster,[2,2]);
  assert.ok(game.legalActions(initial).includes('wait'));
});

test('walls move before pursuit and can close the shortest passage',()=>{
  const initial=game.create(['S....','##.##','.....','....E'],{
    monster:[2,2],movers:[{path:[[1,2],[0,2]],index:1,direction:-1}]
  });
  const next=game.step(initial,'wait');
  assert.deepEqual(next.movers[0].path[next.movers[0].index],[1,2]);
  assert.deepEqual(next.monster,[2,2]);
  assert.equal(next.lost,false);
});

test('a monster can hold one wall without freezing other walls or getting crushed',()=>{
  const initial=game.create(open,{monster:[2,2],movers:[
    {path:[[2,1],[2,2]],index:0,direction:1},
    {path:[[3,3],[3,4]],index:0,direction:1}
  ]});
  const obs=game.observe(initial);
  assert.equal(obs.movers[0].held,true);
  assert.equal(obs.movers[0].heldBy,'monster');
  const next=game.step(initial,'wait');
  assert.equal(next.movers[0].index,0);
  assert.equal(next.movers[1].index,1);
  assert.deepEqual(next.monster,[1,2]);
});

test('sliding through a monster loses at contact even if the exit is farther down that slide',()=>{
  const initial=game.create(['S...E','.....'],{monster:[0,2]});
  const lost=game.step(initial,'right');
  assert.equal(lost.lost,true);
  assert.equal(lost.won,false);
  assert.equal(lost.deathCause,'slide');
  assert.deepEqual(lost.position,[0,2]);
  assert.equal(lost.moves,1);
  assert.deepEqual(game.legalActions(lost),[]);
  assert.strictEqual(game.step(lost,'wait'),lost);
  assert.equal(game.solve(lost),null);
});

test('pursuit contact kills after a Wait, but exiting alive ends the turn before pursuit',()=>{
  const initial=game.create(['S.E','...'],{monster:[1,0]});
  const lost=game.step(initial,'wait');
  assert.equal(lost.lost,true);
  assert.equal(lost.deathCause,'pursuit');
  assert.deepEqual(lost.monster,[0,0]);
  const won=game.step(initial,'right');
  assert.equal(won.won,true);
  assert.equal(won.lost,false);
  assert.deepEqual(won.monster,[1,0]);
});

test('blocked and illegal actions spend no pursuit time, including after a loss',()=>{
  const initial=game.create(open,{monster:[1,0]});
  assert.strictEqual(game.step(initial,'up'),initial);
  assert.throws(()=>game.step(initial,'teleport'),/action|direction/i);
  assert.equal(initial.moves,0);
  assert.deepEqual(initial.monster,[1,0]);
  const lost=game.step(initial,'wait');
  assert.throws(()=>game.step(lost,'teleport'),/action|direction/i);
  assert.strictEqual(game.step(lost,'right'),lost);
});

test('IF YOU WAIT previews include wall closures, holds, and capture and are detached',()=>{
  const initial=game.create(open,{monster:[2,2]});
  const obs=game.observe(initial),waited=game.step(initial,'wait');
  assert.deepEqual(obs.monster.position,[2,2]);
  assert.deepEqual(obs.monster.waitPosition,waited.monster);
  assert.equal(obs.monster.waitLethal,false);
  obs.monster.position[0]=99;obs.monster.waitPosition[0]=99;
  assert.deepEqual(initial.monster,[2,2]);
  assert.equal(game.observe(game.create(open,{monster:[1,0]})).monster.waitLethal,true);
});

test('the safe solver rejects the direct captured route and keys monster position',()=>{
  const board=['S...E','.....','.....'];
  const initial=game.create(board,{monster:[0,2]});
  const path=game.solve(initial);
  assert.ok(path);
  assert.notEqual(path[0],'right');
  let state=initial;
  for(const action of path){state=game.step(state,action);assert.equal(state.lost,false);}
  assert.equal(state.won,true);
  assert.deepEqual(game.solve(game.create(board,{monster:[2,2]})),['right']);
});

test('malformed/overlapping monster spawns and excessive complete search spaces are refused',()=>{
  for(const monster of [[0,0],[2,4],[-1,0],[1,9],[1.5,2],[],{},'x']){
    assert.throws(()=>game.create(open,{monster}),/monster|hunter/i);
  }
  assert.throws(()=>game.create(open,{monster:[1,1],movers:[{path:[[1,1],[1,2]]}]}),/monster|hunter/i);
  assert.throws(()=>game.create(['S#E','...'],{monster:[0,1]}),/monster|hunter/i);
  const large=Array(20).fill('.'.repeat(20));large[0]='S'+'.'.repeat(19);large[19]='.'.repeat(19)+'E';
  assert.throws(()=>game.create(large,{monster:[1,1],movers:[{path:Array.from({length:20},(_,c)=>[2,c])}]}),/shorten|smaller/i);
});

test('monster board exchange preserves spawn and walls, while existing codes stay compatible',()=>{
  const movers=[{path:[[2,1],[2,2]],index:1,direction:-1}],monster=[3,3];
  const decoded=code.decode(code.encode(open,movers,monster));
  assert.deepEqual(game.create(decoded.board,decoded),game.create(open,{movers,monster}));
  assert.deepEqual(code.decode('S.E\n...'),{board:['S.E','...'],movers:[]});
  const previous=code.decode(code.encode(open,movers));
  assert.equal(game.create(previous.board,previous).monster,null);
});

test('three authored hunts have safe acceptance routes using gates and purposeful waits',()=>{
  const hunts=require('../levels.js').filter(level=>level.monster);
  const routes=[
    'right down wait left up right up right down left up',
    'wait down right wait down right up left up',
    'wait right down right left wait right wait wait wait down down right left down right'
  ];
  assert.equal(hunts.length,3);
  hunts.forEach((level,i)=>{
    let state=game.create(level.board,level),monsterHolds=0;
    const brakes=new Set(),deltas={up:[-1,0],right:[0,1],down:[1,0],left:[0,-1]};
    const actions=routes[i].split(' ');
    assert.equal(game.solve(state).length,actions.length,level.name);
    assert.equal(game.solve(game.create(level.board,{monster:level.monster})),null,'gates are necessary');
    for(const action of actions){
      monsterHolds+=game.observe(state).movers.filter(m=>m.heldBy==='monster').length;
      const previous=state;state=game.step(state,action);
      if(deltas[action]&&!state.won)previous.movers.forEach((m,index)=>{
        const p=m.path[m.index],d=deltas[action];
        if(state.position[0]+d[0]===p[0]&&state.position[1]+d[1]===p[1])brakes.add(index);
      });
      assert.notStrictEqual(state,previous,'every action spends a turn');
      assert.equal(state.lost,false,level.name);
      for(const m of state.movers){
        assert.notDeepEqual(m.path[m.index],state.position);
        assert.notDeepEqual(m.path[m.index],state.monster);
      }
    }
    assert.ok(monsterHolds>0,'hunter interacts with gate rhythm');
    assert.ok(brakes.size>0,'gates still provide stopping points');
    if(i===2)assert.equal(brakes.size,3,'the last hunt borrows all three brakes');
    assert.equal(state.won,true,level.name);
    assert.equal(state.moves,actions.length);
    assert.deepEqual(game.solve(state),[]);
  });
});

test('all reachable small-puzzle states preserve actor separation and exact Wait previews',()=>{
  const initial=game.create(['S...E','.....','.....'],{monster:[0,2],movers:[{path:[[1,1],[1,2]],index:0}]});
  const key=s=>JSON.stringify([s.position,s.monster,s.movers.map(m=>[m.index,m.direction]),s.won,s.lost]);
  const queue=[initial],seen=new Set([key(initial)]);
  for(let cursor=0;cursor<queue.length;cursor++){
    const s=queue[cursor],obs=game.observe(s),w=game.step(s,'wait');
    assert.deepEqual(obs.monster.waitPosition,w.monster);
    if(!s.won&&!s.lost)assert.equal(obs.monster.waitLethal,w.lost);
    for(const m of s.movers){
      assert.notDeepEqual(m.path[m.index],s.position);
      assert.notDeepEqual(m.path[m.index],s.monster);
    }
    if(s.lost)assert.deepEqual(s.position,s.monster);
    else assert.notDeepEqual(s.position,s.monster);
    for(const a of game.legalActions(s)){
      const n=game.step(s,a),k=key(n);if(!seen.has(k)){seen.add(k);queue.push(n);}
    }
  }
  assert.ok(queue.some(s=>s.won));assert.ok(queue.some(s=>s.lost));
  const actorPhases=new Map();
  for(const s of queue){
    const phase=JSON.stringify([s.position,s.movers.map(m=>[m.index,m.direction])]);
    if(!actorPhases.has(phase))actorPhases.set(phase,new Set());
    actorPhases.get(phase).add(s.monster.join(','));
  }
  assert.ok([...actorPhases.values()].some(cells=>cells.size>1),'the same player/gate phase can have distinct hunter cells');
});
