(function(root){
 const levels = [
  {name:'First room', prompt:'You only stop when something stops you.', board:['..S#.','.#...','...#.','...E.','#....']},
  {name:'Second room', prompt:'Look for where you can stop.', board:['...#...','....###','.#.E...','##....#','...##..','..S....','....#..']},
  {name:'Third room', prompt:'A new room. Same rules.', board:['...#..#','S......','.#.....','#.#.#..','..#....','.......','E#.....']}
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
