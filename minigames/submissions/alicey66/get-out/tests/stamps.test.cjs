const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../engine.js'),levels=require('../levels.js'),S=require('../stamps.js');
const board=levels[0].board,marks=[{position:[1,0],label:'turn'},{position:[1,4],label:'stop'}];
const start=()=>S.create(board,marks),down=s=>S.move(s,'down');
test('author exchange roundtrip strips session fields and accepts original board codes',()=>{
 const data=S.parse(S.encode(board,marks));assert.deepEqual(data,{board,stamps:marks});
 assert.deepEqual(S.parse(board.join('\n')),{board,stamps:[]});
 assert.equal(S.encode(board,marks).includes('judgments'),false);data.stamps[0].position[0]=6;assert.equal(marks[0].position[0],1);
});
test('author stamps must be unique valid labels at reachable floor stops, maximum two',()=>{
 for(const position of [[0,0],[3,4],[0,1],[1,1],[-1,0],[1.5,0]])assert.throws(()=>S.validate(board,[{position,label:'turn'}]));
 assert.throws(()=>S.validate(board,[marks[0],marks[0]]));assert.throws(()=>S.validate(board,[...marks,marks[0]]));
 assert.throws(()=>S.validate(board,[{position:[1,0],label:'unknown'}]));
 for(const code of ['{bad','[]','x'.repeat(33000),'{"format":"wrong"}'])assert.throws(()=>S.parse(code));
});
test('a normal stop offers a stamp; a crossed marker and blocked move do not',()=>{
 let s=start();assert.equal(S.move(s,'right').eligible,null);s=down(s);assert.equal(s.eligible,'1,0');
 const crossing=['....E','..#..','S....','.....','...#.'];let t=S.create(crossing,[{position:[2,2],label:'stop'}]);
 t=S.move(t,'right');assert.equal(t.eligible,null);assert.equal(t.moves,1);
});
test('skip preserves the guess opportunity and a later normal revisit offers it again',()=>{
 let s=S.skip(down(start()));assert.equal(s.eligible,null);assert.equal(s.judgments.length,0);
 s=S.move(S.move(s,'right'),'left');assert.equal(s.eligible,'1,0');assert.equal(S.open(s).pending.phase,'choice');
});
test('matching records a result without teleport or a movement undo entry',()=>{
 const s=S.guess(S.open(down(start())),'turn');assert.equal(s.results['1,0'].match,true);assert.equal(s.pending,null);assert.equal(s.moves,1);assert.equal(s.undoStack.length,1);
 assert.equal(S.stats(s).first.matches,1);assert.throws(()=>S.guess(s,'turn'));
});
test('mismatch records before preview and guards position-changing actions until delivery',()=>{
 const s=S.guess(S.open(down(start())),'stop');assert.equal(s.judgments.length,1);assert.equal(s.pending.phase,'preview');assert.deepEqual(s.pending.candidates,[[0,0]]);
 assert.deepEqual(s.position,[1,0]);for(const action of [()=>S.move(s,'right'),()=>S.undo(s),()=>S.reset(s),()=>S.guess(s,'turn')])assert.throws(action);
 assert.ok(s.events.findIndex(e=>e.type==='judgment')<s.events.findIndex(e=>e.type==='preview'));
});
test('candidate pool uses last three distinct actual stops, excludes current, and is detached',()=>{
 const s={...start(),position:[1,4],stops:[[2,0],[1,0],[3,0],[1,0],[1,4],[4,0],[1,4]]};
 assert.deepEqual(S.candidates(s),[[4,0],[1,0],[3,0]]);const pool=S.candidates(s);pool[0][0]=99;assert.equal(s.stops[5][0],4);
});
test('delivery samples the pool, costs no move, increments loss count and does not offer a stamp',()=>{
 let s=S.guess(S.open(down(start())),'detour');s=S.deliver(s,()=>0);
 assert.deepEqual(s.position,[0,0]);assert.equal(s.moves,1);assert.equal(s.misdeliveries,1);assert.equal(s.won,false);assert.equal(s.eligible,null);assert.equal(s.pending,null);assert.equal(s.stops.length,1);
 assert.deepEqual(s.judgments[0].destination,[0,0]);
});
test('Undo reverses teleport then prior slide, preserving judgment and actual-stop history',()=>{
 let s=S.deliver(S.guess(S.open(down(start())),'stop'),()=>0);s=S.undo(s);
 assert.deepEqual(s.position,[1,0]);assert.equal(s.moves,1);assert.equal(s.results['1,0'].match,false);assert.equal(s.eligible,null);
 s=S.undo(s);assert.deepEqual(s.position,[0,0]);assert.equal(s.moves,0);assert.equal(s.judgments.length,1);assert.deepEqual(s.stops,[[1,0]]);
});
test('teleporting onto an unjudged stamp or exit neither opens it nor wins',()=>{
 let s=S.guess(S.open(S.move(down(start()),'right')),'turn');
 s=S.deliver(s,()=>0);assert.deepEqual(s.position,[1,0]);assert.equal(s.eligible,null);assert.equal(s.results['1,0'],undefined);
 let t=S.guess(S.open(down(start())),'stop');t={...t,pending:{...t.pending,candidates:[[3,4]]}};t=S.deliver(t,()=>0);
 assert.deepEqual(t.position,[3,4]);assert.equal(t.won,false);assert.equal(t.moves,1);
});
test('Reset keeps first judgments and reset count while round stamp guesses become available',()=>{
 let s=S.guess(S.open(down(start())),'turn');s=S.reset(s);assert.equal(s.resetCount,1);assert.equal(s.round,2);assert.equal(s.moves,0);assert.deepEqual(s.results,{});assert.deepEqual(s.stops,[]);
 s=S.guess(S.open(down(s)),'stop');assert.equal(S.stats(s).first.attempts,1);assert.equal(S.stats(s).retry.attempts,1);assert.equal(S.stats(s).retry.matches,0);assert.equal(s.judgments[1].first,false);
});
test('reported match/judged/total counts distinguish unseen stamps',()=>{
 let s=S.guess(S.open(down(start())),'turn');assert.deepEqual(S.stats(s).round,{matches:1,judged:1,total:2});
});
test('geometry is label independent and distinguishes all author arrivals from actual arrival',()=>{
 assert.deepEqual(S.geometry(board,[1,0]),S.geometry(board,[1,0]));
 const g=S.geometry(board,[1,0],'down');assert.equal(g.contacts.length,1);assert.deepEqual(g.contacts[0].blocker,[2,0]);
 assert.equal(g.contacts[0].side,'top');assert.ok(S.geometry(board,[1,0]).contacts.length>=1);
 assert.equal(S.geometry(board,[1,4],'right').exitLines.some(p=>p[0]===3&&p[1]===4),true);
});
test('trace preserves first/retry audit and can be reviewed independently of the live game',()=>{
 let s=S.guess(S.open(down(start())),'turn');s=S.reset(s);s=S.deliver(S.guess(S.open(down(s)),'stop'),()=>0);
 const trace=S.exportTrace(s),review=S.reviewTrace(JSON.stringify(trace));assert.equal(review.resetCount,1);assert.equal(review.stats.first.matches,1);assert.equal(review.stats.retry.matches,0);
 const bad={...trace,judgments:[{...trace.judgments[0],match:false}]};assert.throws(()=>S.reviewTrace(JSON.stringify(bad)));
});
test('full core solution stays valid when stamps are skipped; hints ignore optional guesses',()=>{
 let s=start();for(const action of core.solve(core.create(board)))s=S.move(s,action);
 assert.equal(s.won,true);assert.equal(s.judgments.length,0);assert.equal(S.hint(down(start())).hints,1);
});
test('a non-winning exit position still has a valid leave-and-return hint route',()=>{
 const b=['S..','...','..E'],s={...core.create(b),position:[2,2],won:false};
 const path=core.solve(s);assert.ok(path&&path.length>0);let n=s;for(const a of path)n=core.step(n,a);assert.equal(n.won,true);
});

test('uniform pool indexing includes the last candidate and rejects invalid random values',()=>{
 const b=levels[1].board;let s=S.create(b,[{position:[6,4],label:'turn'}]);
 for(const a of ['down','right','down','right'])s=S.move(s,a);
 s=S.guess(S.open(s),'stop');assert.deepEqual(s.pending.candidates,[[6,1],[3,1],[3,0]]);
 assert.deepEqual(S.deliver(s,()=>0.999999).position,[3,0]);
 assert.deepEqual(S.deliver(s,()=>0.34).position,[3,1]);
 for(const v of [-0.1,1,NaN,Infinity])assert.throws(()=>S.deliver(s,()=>v));
});
