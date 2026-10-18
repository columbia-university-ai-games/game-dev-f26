(function(root){
 const levels = [
  {name:'Find your feet', stage:'Warm-up', lesson:'Use a wall to stop, then turn toward the exit.', prompt:'A wall can give you somewhere to stop.', board:['S#.#..#','.....#.','#.##...','....E..','....#..','..#.#..','#....#.']},
  {name:'One more turn', stage:'Warm-up', lesson:'Connect stopping points over several turns.', prompt:'Where could a wall line you up with the door?', board:['S.##...','...#...','.......','..##E..','#......','.....##','#....#.']},
  {name:'Take the long way', stage:'Practice', lesson:'Apply the same idea after one wall changes.', prompt:'One wall has moved. Which part of your route still works?', board:['S..#...','...#...','.......','..##E..','#......','.....##','#....#.']},
  {name:'A place to turn', stage:'Practice', lesson:'Use a stop on the far side to set up your approach.', prompt:'Try planning the last turn before the first one.', board:['S#.....','.....##','...#.#.','..#.E.#','......#','.......','...#...']},
  {name:'Change direction', stage:'Practice', lesson:'Find a different approach when a stopping wall is removed.', prompt:'The wall below the right edge is gone. Where can you stop now?', board:['S#.....','.....##','...#.#.','..#.E.#','.......','.......','...#...']},
  {name:'Build a detour', stage:'Challenge', lesson:'Combine turns into a route that first leads away.', prompt:'Moving away from the door can create a useful return.', board:['S......','.###.#.','#......','....E#.','.......','.....#.','.##....']},
  {name:'A useful detour', stage:'Challenge', lesson:'Adapt your detour after two stopping walls are removed.', prompt:'Which earlier stopping point can replace the missing walls?', board:['S......','.###.#.','#......','....E#.','.......','.......','..#....']}
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
