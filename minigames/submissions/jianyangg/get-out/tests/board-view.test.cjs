const {test}=require('node:test');
const assert=require('node:assert/strict');
const {BoardView}=require('../board-view.js');
function element(){return {style:{setProperty(name,value){this[name]=value;}},children:[],textContent:'',attributes:{},append(child){this.children.push(child);},replaceChildren(...children){this.children=children;},setAttribute(name,value){this.attributes[name]=value;}};}
function fixture(){const board=element();board.ownerDocument={createElement:element,createElementNS:element};return {board,view:new BoardView(board)};}
const state={board:['S..','...','..E'],position:[0,0],gravity:'down',grounded:false};
test('movement preserves the player and grid so interpolation is uninterrupted',()=>{
 const {board,view}=fixture();view.render(state);
 const cells=board.children.slice(),player=board.children.at(-1);
 view.render({...state,position:[1,0]});
 assert.equal(board.children.at(-1),player);
 assert.deepEqual(board.children,cells);
 assert.equal(player.style.top,'33.333333333333336%');
 assert.equal(player.children[0].textContent,'••');
});
test('resets snap to spawn, and a changed board rebuilds the grid',()=>{
 const {board,view}=fixture();view.render(state);
 const player=board.children.at(-1);
 view.render({...state,position:[1,0]},{snap:true});
 assert.equal(player.style.transition,'none');
 view.resumeMotion();assert.equal(player.style.transition,'');
 view.render({...state,board:['S.E','...']});
 assert.notEqual(board.children.at(-1),player);
 assert.equal(board.children.length,7);
});
test('standing and jumping animate the same flexible plank',()=>{
 const {view}=fixture();
 const standing={...state,board:['#####','#..E#','#S..#','#T###'],position:[2,1],grounded:true,rise:0};
 view.render(standing,{time:0});view.resumeMotion(70);
 const spring=view.springs.get('3,1');
 const plank=spring.element.children.find(child=>child.attributes.fill==='#b47a37');
 const loaded=plank.attributes.d;
 view.render({...standing,grounded:false,rise:1},{time:100});view.resumeMotion(100);
 assert.notEqual(plank.attributes.d,loaded);
 view.resumeMotion(500);assert.equal(spring.motion.sample(500),0);
});
test('spike reaction renders grey crossed eyes at impact before the respawn position',()=>{
 const {board,view}=fixture();
 const before={...state,position:[1,1],gravity:'right'};
 view.render(before,{time:0});
 view.showImpact({kind:'spike',position:[1,1],gravity:'right',normal:[0,-1]},before,{time:100});
 view.render(state,{snap:true,time:110});
 let player=board.children.at(-1);
 assert.equal(player.children[0].textContent,'××');assert.equal(player.children[0].className,'hit-spike');
 assert.equal(player.style.top,'33.333333333333336%');
 view.render(state,{snap:true,time:600});player=board.children.at(-1);
 assert.equal(player.style.top,'0%');assert.equal(player.children[0].textContent,'••');
});
test('lava reaction tints and offsets the existing avatar, then clears its pose',()=>{
 const {board,view}=fixture();view.render(state,{time:0});
 view.showImpact({kind:'lava',position:[0,0],gravity:'down',normal:[-1,0]},state,{time:0});
 view.resumeMotion(77);const player=board.children.at(-1);
 assert.equal(player.children[0].className,'hit-lava');assert.match(player.style.transform,/translate/);
 view.resumeMotion(300);assert.equal(player.style.transform,'');assert.equal(player.children[0].className,'');
});
