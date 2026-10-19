(function(root){
 const levels = [{
  name:'Two ways out',
  prompt:'Choose at S: LEFT takes the 5-move shortcut; work out its turns yourself. UP takes the easier 7-move guided route: ↑ → ↑ → ↓ → ↓. Directions apply from the start. Reset to choose again, or Undo to reconsider. One hint still points along a shortest route.',
  board:['...#..#','...#...','.....#.','.#.S#.E','...##..','...#...','##....#']
 }];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
