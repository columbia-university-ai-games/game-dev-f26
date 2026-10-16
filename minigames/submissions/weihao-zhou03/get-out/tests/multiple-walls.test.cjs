const {test} = require('node:test');
const assert = require('node:assert/strict');
const game = require('../engine.js');
const code = require('../puzzle-code.js');
const board = ['S.....','......','......','......','......','.....E'];
const movers = [
  {path:[[2,1],[2,2],[2,3]],index:0,direction:1},
  {path:[[1,4],[2,4],[3,4]],index:2,direction:-1}
];
const positions = state => state.movers.map(m=>m.path[m.index]);

test('one Wait moves horizontal and vertical walls simultaneously in opposite directions',()=>{
  const initial = game.create(board,{movers});
  const next = game.step(initial,'wait');
  assert.deepEqual(positions(initial),[[2,1],[3,4]]);
  assert.deepEqual(positions(next),[[2,2],[2,4]]);
  assert.equal(next.moves,1);
  assert.deepEqual(next.position,[0,0]);
  assert.deepEqual(movers[1].path,[[1,4],[2,4],[3,4]]);
});

test('holding one wall with the player does not stop the other wall',()=>{
  const initial = game.create(board,{movers:[
    {path:[[0,1],[0,2]],index:1,direction:-1},
    {path:[[1,3],[2,3],[3,3]],index:0,direction:1}
  ]});
  const next = game.step(initial,'right');
  assert.deepEqual(next.position,[0,1]);
  assert.deepEqual(positions(next),[[0,2],[2,3]]);
  const obs=game.observe(next);
  assert.equal(obs.movers[0].held,true);
  assert.equal(obs.movers[1].held,false);
  const released=game.step(next,'down');
  assert.deepEqual(positions(released),[[0,1],[3,3]]);
});

test('each moving wall can act as a brake, using positions before the wall turn',()=>{
  const initial=game.create(board,{movers:[
    {path:[[0,2],[1,2],[2,2]],index:0,direction:1},
    {path:[[3,1],[3,2],[3,3]],index:1,direction:-1}
  ]});
  const right=game.step(initial,'right');
  assert.deepEqual(right.position,[0,1]);
  const down=game.step(right,'down');
  assert.deepEqual(down.position,[2,1]);
  assert.deepEqual(positions(down),[[2,2],[3,2]]);
  assert.strictEqual(game.step(initial,'up'),initial);
});

test('crossing or overlapping rails are rejected so walls never occupy the same cell',()=>{
  assert.throws(()=>game.create(board,{movers:[
    {path:[[2,1],[2,2],[2,3]],index:0},
    {path:[[1,2],[2,2],[3,2]],index:0}
  ]}),/rails.*cross|overlap/i);
});

test('multiple-wall observations and exchange detach and preserve every wall phase',()=>{
  const initial=game.create(board,{movers});
  const obs=game.observe(initial);
  assert.deepEqual(obs.movers.map(m=>m.targetPosition),[[2,2],[2,4]]);
  obs.movers[1].path[0][0]=99;
  obs.movers[1].targetPosition[0]=99;
  assert.deepEqual(initial.movers[1].path[0],[1,4]);
  const decoded=code.decode(code.encode(initial.board,initial.movers));
  assert.deepEqual(game.create(decoded.board,decoded),initial);
});

test('a win freezes all walls and no subsequent action advances any phase',()=>{
  const initial=game.create(['S.E...','......','......','......','......','......'],{movers});
  const won=game.step(initial,'right');
  assert.equal(won.won,true);
  assert.deepEqual(positions(won),positions(initial));
  assert.strictEqual(game.step(won,'wait'),won);
  assert.deepEqual(game.legalActions(won),[]);
});

test('oversized phase combinations are refused before an expensive hint search',()=>{
  const large=Array(20).fill('.'.repeat(20));
  large[0]='S'+'.'.repeat(19);large[19]='.'.repeat(19)+'E';
  const tracks=[2,4,6].map(r=>({path:Array.from({length:20},(_,c)=>[r,c]),index:0}));
  assert.throws(()=>game.create(large,{movers:tracks}),/shorten.*rail|smaller board/i);
});

test('the new obstacle-rich boards have two movement axes and verified acceptance routes',()=>{
  const levels=require('../levels.js').filter(level=>!level.monster);
  const routes=[
    ['right','down','left','up','right','up','right','down','left','up'],
    ['wait','down','right','down','right','wait','up','left','up'],
    ['wait','right','down','right','left','wait','right','down','right','left','down','right']
  ];
  const counts=[8,15,16];
  levels.forEach((level,i)=>{
    const initial=game.create(level.board,level),path=game.solve(initial);
    assert.equal(level.board.join('').split('#').length-1,counts[i]);
    assert.equal(level.movers.length,i===0?2:3);
    assert.equal(new Set(level.movers.map(m=>m.path[0][0]===m.path[1][0]?'h':'v')).size,2);
    assert.equal(path.length,routes[i].length);
    const final=routes[i].reduce((s,a)=>game.step(s,a),initial);
    assert.equal(final.won,true,level.name);
    assert.equal(game.solve(game.create(level.board)),null);
  });
});

test('the final acceptance route deliberately borrows a brake from all three walls',()=>{
  const level=require('../levels.js')[2];
  let state=game.create(level.board,level);
  const used=new Set();
  for(const action of game.solve(state)){
    const delta={up:[-1,0],right:[0,1],down:[1,0],left:[0,-1]}[action];
    const next=game.step(state,action);
    if(delta&&!next.won)positions(state).forEach((p,i)=>{
      if(next.position[0]+delta[0]===p[0]&&next.position[1]+delta[1]===p[1])used.add(i);
    });
    state=next;
  }
  assert.deepEqual([...used].sort(),[0,1,2]);
});

test('all reachable phases keep actors separate and Wait previews agree with movement',()=>{
  for(const level of require('../levels.js').filter(level=>!level.monster)){
    const initial=game.create(level.board,level),queue=[initial],seen=new Set();
    const key=s=>s.position.join(',')+'|'+s.movers.map(m=>m.index+','+m.direction).join(';');
    seen.add(key(initial));
    for(let cursor=0;cursor<queue.length;cursor++){
      const state=queue[cursor],all=positions(state).map(p=>p.join(','));
      assert.equal(new Set(all).size,all.length);
      assert.ok(!all.includes(state.position.join(',')));
      const obs=game.observe(state),waited=game.step(state,'wait');
      assert.deepEqual(obs.movers.map(m=>m.nextPosition),positions(waited));
      for(const action of game.legalActions(state)){
        const next=game.step(state,action),k=key(next);
        if(!seen.has(k)){seen.add(k);queue.push(next);}
      }
    }
    assert.ok(queue.length>20,level.name);
  }
});

test('more than three moving walls are rejected',()=>{
  const tracks=[1,2,3,4].map(r=>({path:[[r,0],[r,1]],index:0}));
  assert.throws(()=>game.create(board,{movers:tracks}),/at most three/);
});

test('the solver recognizes a reachable dead end in the final maze instead of promising Wait will fix it',()=>{
  const level=require('../levels.js')[2];
  const initial=game.create(level.board,level);
  let state=initial,previous;
  for(const action of ['right','down','down','right','down','up','up','right','up']){
    previous=state;state=game.step(state,action);
  }
  assert.equal(state.won,false);
  assert.equal(game.solve(state),null);
  assert.equal(game.solve(game.step(state,'wait')),null);
  assert.ok(game.solve(previous));
  assert.equal(game.solve(initial).length,12);
});
