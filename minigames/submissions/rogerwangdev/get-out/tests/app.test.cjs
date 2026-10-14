const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const game=require('../engine.js');
function setup(board=['S..','...','..E']){
 const nodes=new Map();
 function element(){return {textContent:'',value:'',children:[],events:{},style:{setProperty(key,value){this[key]=value;}},classList:{toggle(){}},setAttribute(){},replaceChildren(){this.children=[];},append(child){this.children.push(child);},querySelector(){return null;},addEventListener(type,fn){this.events[type]=fn;},focus(){}};}
 const get=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);};
 const buttons=['up','right','down','left'].map(move=>Object.assign(element(),{dataset:{move}}));
 const document={getElementById:get,createElement:element,addEventListener(){},querySelectorAll(selector){return selector==='[data-move]'?buttons:[];}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),{document,GetOut:game,GetOutLevels:[{name:'Test',prompt:'Test',board}]});
 return {get,move:action=>buttons.find(b=>b.dataset.move===action).events.click(),click:id=>get(id).events.click()};
}
test('app decrements, undo restores budget, and exhaustion resets with visible failure',()=>{
 const app=setup();assert.equal(app.get('moves').textContent,4);
 app.move('right');assert.equal(app.get('moves').textContent,3);
 app.click('undo');assert.equal(app.get('moves').textContent,4);
 for(const action of ['right','left','right','left'])app.move(action);
 assert.equal(app.get('moves').textContent,4);
 assert.match(app.get('status').textContent,/Out of moves! Attempt failed. Level reset/);
 assert.equal(app.get('undo').disabled,true);
 assert.match(app.get('trace-list').children.at(-1).textContent,/failed; level reset/);
 app.click('hint');assert.match(app.get('status').textContent,/right/);
 app.move('right');app.move('down');assert.match(app.get('status').textContent,/You got out/);
 app.click('reset');assert.equal(app.get('moves').textContent,4);
 assert.equal(app.get('hint').disabled,false);
});


test('pushing updates marker, undo and reset restore block and budget',()=>{
 const app=setup(['S.B..','....E']);const block=()=>app.get('board').children.find(n=>n.className==='push-block');
 const budget=app.get('moves').textContent;assert.equal(block().style['--x'],2);
 app.move('right');assert.equal(block().style['--x'],3);assert.equal(app.get('moves').textContent,budget-1);
 app.click('undo');assert.equal(block().style['--x'],2);assert.equal(app.get('moves').textContent,budget);
 app.move('right');app.click('reset');assert.equal(block().style['--x'],2);
});
