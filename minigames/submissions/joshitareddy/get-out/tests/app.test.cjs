const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

class Element {
 constructor(id='') {
  this.id=id;this.children=[];this.dataset={};this.listeners={};this.style={setProperty(){}};
  this.classList={toggle(){}};this.textContent='';this.value='';this.hidden=false;this.disabled=false;
 }
 append(...children){this.children.push(...children);}
 appendChild(child){this.append(child);return child;}
 replaceChildren(...children){this.children=[...children];}
 setAttribute(name,value){this[name]=value;}
 addEventListener(type,listener){this.listeners[type]=listener;}
 querySelector(selector){return selector==='.player'?this.children.find(child=>child.className==='player')||null:null;}
 focus(){} select(){} scrollIntoView(){}
}

function makeDom(){
 const ids=['levels','status','level-number','level-title','moves','prompt','editor','edit','undo','reset',
  'hint','next','board','trace-list','cancel-edit','blank','play-custom','board-code','export','import',
  'download','exchange'];
 const elements=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
 const moves=['up','right','down','left'].map(action=>{const button=new Element();button.dataset.move=action;return button;});
 return {
  elements,moves,
  document:{
   getElementById:id=>elements[id],
   createElement:()=>new Element(),
   querySelectorAll:selector=>selector==='[data-move]'?moves:[],
   querySelector:()=>({value:'#'}),
   addEventListener(){}
  }
 };
}

test('the app labels hints and visibly resets a level after an unsolvable move',t=>{
 const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
 assert.match(html,/<button id="hint" class="secondary">Hints<\/button>/);

 const {document,elements,moves}=makeDom(),originalRandom=Math.random;
 Math.random=()=>0;
 global.document=document;
 global.GetOut=require('../engine.js');
 global.GetOutLevels=require('../levels.js');
 t.after(()=>{
  Math.random=originalRandom;
  delete global.document;delete global.GetOut;delete global.GetOutLevels;
  delete require.cache[require.resolve('../app.js')];
 });
 require('../app.js');

 elements.levels.value='5';
 elements.levels.listeners.change({target:elements.levels});
 const click=action=>moves.find(button=>button.dataset.move===action).listeners.click();
 for(const action of ['right','down','right','right'])click(action);
 assert.notEqual(elements.moves.textContent,'0');
 click('right');

 assert.equal(elements.status.textContent,
  'That move left no path to the exit, so this level was reset. Try another route.');
 assert.equal(elements.moves.textContent,0);
 assert.equal(elements.undo.disabled,true);
 assert.equal(elements['trace-list'].children[0].textContent,'No moves yet.');
 const stoppingWall=elements.board.children[3*6+4];
 assert.match(stoppingWall.className,/wall/);
 assert.doesNotMatch(stoppingWall.className,/breakable/);
});
