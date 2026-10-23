import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../src/core/game.ts';
import {createWorld, applyAction, project, legalActions} from '../src/core/simulation.ts';
import {canNavigate} from '../src/core/math.ts';

test('R1/R2 pure reads, invalid actions and terminal steps never advance time',()=>{
 const g=createGame(101,'A'); const before=g.observe();
 assert.deepEqual(g.observe(),before); assert.deepEqual(g.legal_actions(),before.legalActions);
 assert.equal(g.step('human',{id:'reel:strong'}).accepted,false); assert.deepEqual(g.observe(),before);
 const r=g.step('human',{id:'return'}); assert.equal(r.accepted,true); assert.equal(r.observation.outcome.success,false);
 assert.equal(g.step('human',{id:'wait'}).accepted,false);
});
test('R3 fast movement checks swept path, not just destination',()=>{
 const w=createWorld(101,'A'); w.boat.position={x:30,y:37};
 assert.equal(legalActions(w).includes('move:E:rush'),false);
});
test('REG-001 swept collision rejects a grazing reef vertex between old sample points',()=>{
 const w=createWorld(101,'A');
 assert.equal(canNavigate({x:40.6381123394,y:28.6596275657},{x:45.5878598077,y:33.6093750340},w.map),false);
 w.boat.position={x:66.306,y:24.394};assert.equal(legalActions(w).includes('move:E:rush'),false);
});
test('R4 sonar snapshots remain fixed while uncertainty grows',()=>{
 const w=createWorld(101,'A'); applyAction(w,'ping:strong');
 const first=project(w).contacts.find(c=>c.hint==='fish-school'); assert.ok(first);
 applyAction(w,'wait'); const aged=project(w).contacts.find(c=>c.id===first.id); assert.ok(aged);
 assert.deepEqual(aged.position,first.position); assert.ok(aged.uncertainty>first.uncertainty);
});
test('R5 delayed beacon starts at announced tick and expires',()=>{
 const w=createWorld(101,'A'); applyAction(w,'beacon:chime:2');
 assert.equal(project(w).beacons[0].active,false);
 applyAction(w,'wait'); assert.equal(project(w).beacons[0].active,false);
 applyAction(w,'wait'); assert.equal(project(w).beacons[0].active,true);
 for(let i=0;i<9;i++)applyAction(w,'wait'); assert.equal(project(w).beacons.length,0);
});
test('R6 a fish keeps investigating its recently heard sound after the beacon stops',()=>{
 const w=createWorld(101,'A');const fish=w.fish[0];fish.position={x:29,y:53};fish.home={x:29,y:53};
 w.beacons=[{id:'probe',position:{x:19,y:53},profile:'chime',startTick:0,endTick:2}];
 applyAction(w,'wait');const first=fish.position.x;applyAction(w,'wait');
 assert.ok(fish.position.x<first,'recent acoustic interest should persist briefly instead of instantly returning home');
});
test('R6 a predator follows a heard location, not an unheard new boat position',()=>{
 const w=createWorld(101,'A');w.boat.position={x:20,y:54};w.predator.position={x:60,y:54};
 applyAction(w,'ping:strong');assert.deepEqual(w.predator.target,{x:20,y:54});
 applyAction(w,'move:W:quiet');assert.deepEqual(w.predator.target,{x:20,y:54});assert.equal(w.boat.position.x,16);
});
test('R5/R6 beacon delay changes the actual acoustic opportunity, not only animation',()=>{
 const early=createWorld(101,'A'),late=createWorld(101,'A');
 for(const w of [early,late]){w.boat.position={x:20,y:52};w.predator.position={x:42,y:52};}
 applyAction(early,'beacon:drone:0');applyAction(late,'beacon:drone:2');
 assert.equal(early.predator.mode,'INVESTIGATE');assert.equal(late.predator.mode,'PATROL');
 assert.notDeepEqual(early.fish[0].position,late.fish[0].position);
});
test('R4/R6 loud discovery can scatter a silver-bell school, while chime attracts it',()=>{
 const loud=createWorld(101,'A'),soft=createWorld(101,'A');
 for(const w of [loud,soft]){w.fish[0].position={x:18,y:54};w.fish[0].home={x:18,y:54};}
 applyAction(loud,'ping:strong');applyAction(soft,'beacon:chime:0');
 assert.ok(loud.fish[0].position.x>18);assert.ok(soft.fish[0].position.x<18);
});
test('R7 current tired cue resolves this reel before generating next cue',()=>{
 const w=createWorld(101,'A'); const fish=w.fish[0];
 w.fishing={fishId:fish.id,progress:0,tension:15,cue:'tired'};
 applyAction(w,'reel:strong'); assert.equal(w.fishing?.progress,38); assert.equal(w.fishing?.tension,29);
});
test('R8 announced corridor stays fixed and evade cuts then moves before resolution',()=>{
 const w=createWorld(101,'A'); w.boat.position={x:20,y:54};
 w.fishing={fishId:w.fish[0].id,progress:80,tension:30,cue:'tired'};
 w.predator.position={x:28,y:54}; w.predator.mode='WINDUP';
 w.threat={start:{x:28,y:54},end:{x:16,y:54},width:3.5,resolvesIn:1};
 applyAction(w,'evade:N'); assert.equal(w.fishing,null); assert.equal(w.boat.hull,3);
 assert.deepEqual(w.boat.position,{x:20,y:46});
});
test('R8 a newly announced attack does not deal same-tick damage',()=>{
 const w=createWorld(101,'A'); w.predator.position={x:20,y:54}; w.boat.position={x:15,y:54};
 w.predator.mode='INVESTIGATE'; applyAction(w,'wait');
 assert.ok(w.threat); assert.equal(w.boat.hull,3);
});
test('R10/R11 final permitted return banks cargo and wins before expiry',()=>{
 const w=createWorld(101,'A'); w.tick=w.scenario.budget-1;
 w.boat.cargo=[{species:'silver-bell',value:12},{species:'silver-bell',value:12}];
 assert.equal(project(w).outcome.delivered.length,0); applyAction(w,'return');
 assert.equal(w.result.reason,'returned'); assert.equal(w.result.success,true); assert.equal(w.result.delivered.length,2);
});
test('REG-002 already announced attack resolves before docking can bank cargo',()=>{
 const w=createWorld(101,'A');w.boat.hull=1;w.boat.cargo=[{species:'silver-bell',value:12},{species:'silver-bell',value:12}];
 w.predator.position={x:19,y:54};w.predator.mode='WINDUP';
 w.threat={start:{x:19,y:54},end:{x:8,y:54},width:3.5,resolvesIn:1};
 applyAction(w,'return');assert.equal(w.result.reason,'sunk');assert.equal(w.result.success,false);assert.equal(w.threat,null);
});
test('R12 hidden layouts do not affect initial public observation or action legality',()=>{
 const a=createWorld(101,'A'), b=createWorld(999,'A');
 b.fish[0].position={x:55,y:22}; b.predator.position={x:85,y:15};
 assert.deepEqual(project(a),project(b)); assert.deepEqual(legalActions(a),legalActions(b));
});
test('R1 deterministic trace and explicit night expiry',()=>{
 const a=createGame(42,'B'),b=createGame(42,'B');
 for(let i=0;i<90;i++){const action={id:i%7===0?'ping:weak':'wait'};a.step('p',action);b.step('p',action);}
 assert.deepEqual(a.observe(),b.observe()); assert.equal(a.outcome().reason,'night_expired');
});
