const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const game=require('../engine.js');
function harness(){
 class Element {
  constructor(){this.children=[];this.handlers={};this.style={setProperty(){}};this.classList={toggle(){}};this.dataset={};}
  append(e){this.children.push(e);}
  replaceChildren(){this.children=[];}
  setAttribute(k,v){this[k]=v;}
  addEventListener(k,fn){this.handlers[k]=fn;}
  querySelector(){return this.children.find(e=>e.className==='player');}
  focus(){} select(){}
  click(){this.handlers.click?.({target:this});}
 }
 const ids=new Map();const $=id=>{if(!ids.has(id))ids.set(id,new Element());return ids.get(id);};
 const buttons=['up','right','down','left'].map(a=>{const b=new Element();b.dataset.move=a;return b;});
 const document={getElementById:$,createElement:()=>new Element(),addEventListener(){},
  querySelectorAll:s=>s==='[data-move]'?buttons:[],querySelector:()=>({value:'W'})};
 vm.runInNewContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),{document,GetOut:game,GetOutLevels:require('../levels.js')});
 return {$,move:a=>buttons.find(b=>b.dataset.move===a).click()};
}
test('UI handlers redraw pushes and undo, reset original walls, hint, then complete',()=>{
 const {$,move}=harness();const wall=()=>$('board').children[3].className;
 move('right');assert.match(wall(),/sliding-wall/);assert.equal($('moves').textContent,1);
 $('undo').click();assert.doesNotMatch(wall(),/sliding-wall/);assert.equal($('moves').textContent,0);
 move('right');$('reset').click();assert.doesNotMatch(wall(),/sliding-wall/);
 $('hint').click();assert.match($('status').textContent,/right/);
 move('right');move('down');assert.match($('status').textContent,/got out/);
 assert.equal($('hint').disabled,true);$('undo').click();assert.equal($('hint').disabled,false);
});
test('exchange roundtrip and normal pasted CRLF board keep W and remain playable',()=>{
 const {$,move}=harness();$('export').click();
 const code=$('board-code').value;assert.equal(code,'S.W..\n##.##\n..E..');
 $('board-code').value=code.replaceAll('\n','\r\n');$('import').click();
 assert.match($('status').textContent,/route to the exit/);
 move('right');assert.equal($('moves').textContent,1);
 $('export').click();assert.equal($('board-code').value,code); // Starting board, not moved layout.
 $('board-code').value='SWE\n###';$('import').click();
 assert.match($('status').textContent,/no route/);assert.equal($('moves').textContent,1);
});
