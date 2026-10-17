const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const game=require('../engine.js');
function browser(){
 const elements=new Map(), events={}, buttons=['up','right','down','left'].map(direction=>({dataset:{move:direction},addEventListener(type,fn){this[type]=fn;}}));
 let now=0, timer;
 const document={hidden:false,activeElement:null,
  getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},
  createElement:()=>element(),querySelectorAll:selector=>selector==='[data-move]'?buttons:[],
  addEventListener(type,fn){events[type]=fn;}};
 function element(){return {children:[],handlers:{},style:{setProperty(){}},classList:{toggle(){}},
  append(e){this.children.push(e);},replaceChildren(){this.children=[];},setAttribute(k,v){this[k]=v;},
  addEventListener(k,v){this.handlers[k]=v;},querySelector(selector){return this.children.find(c=>c.className==='player');},
  focus(){document.activeElement=this;}};}
 const context={GetOut:game,GetOutLevels:[{name:'Interception',prompt:'',board:['#.....E','.......','..M....','..S....','.......']}],
  document,performance:{now:()=>now},setInterval:fn=>{timer=fn;}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),context);
 return {click:id=>elements.get(id).handlers.click(),move:direction=>buttons.find(b=>b.dataset.move===direction).click(),
  beat(ms=900){now+=ms;timer();},cell(r,c){return elements.get('board').children[r*7+c];},
  player:()=>elements.get('board').querySelector('.player'),
  walls:()=>elements.get('board').children.filter(e=>e.className==='wall-piece sliding-wall'),
  moves:()=>elements.get('moves').textContent};
}
test('browser clock is slow and player can redirect between autonomous beats',()=>{
 const b=browser();b.move('up');assert.match(b.cell(2,2)['aria-label'],/moving up/);
 b.beat(899);assert.match(b.cell(2,2)['aria-label'],/moving up/);
 b.beat(1);assert.match(b.cell(1,2)['aria-label'],/moving up/);
 for(const a of ['left','up','right'])b.move(a);
 assert.match(b.cell(1,2)['aria-label'],/moving right/);
 b.beat();assert.match(b.cell(1,3)['aria-label'],/moving right/);
});
test('undo restores heading and pauses, reset clears motion, hints pause clock',()=>{
 const b=browser();b.move('up');b.beat();
 for(const a of ['left','up','right'])b.move(a);
 b.beat();b.click('undo');assert.match(b.cell(1,2)['aria-label'],/moving up/);
 b.beat();assert.match(b.cell(1,2)['aria-label'],/moving up/);
 b.click('reset');assert.match(b.cell(2,2)['aria-label'],/stopped/);
 b.move('up');b.click('hint');b.beat();assert.match(b.cell(2,2)['aria-label'],/moving up/);
 b.click('wait');assert.match(b.cell(1,2)['aria-label'],/moving up/);
 b.beat();assert.match(b.cell(1,2)['aria-label'],/moving up/);
});

test('player and wall elements survive moves and ticks so CSS transitions can run',()=>{
 const b=browser(),player=b.player(),wall=b.walls()[0];
 b.move('up');assert.equal(b.player(),player);assert.equal(b.walls()[0],wall);
 b.beat();assert.equal(b.player(),player);assert.equal(b.walls()[0],wall);
 for(const a of ['left','up','right'])b.move(a);
 b.beat();assert.equal(b.player(),player);assert.equal(b.walls()[0],wall);
 assert.equal(b.walls().length,1);
});
