(function(root){
 // Reference boards; walls drift one square at random after every move.
 const levels = [
  {name:'Find your feet', prompt:'Watch where the walls go after your first move.', board:['S#.#..#','.....#.','#.##...','....E..','....#..','..#.#..','#....#.']},
  {name:'Take the long way', prompt:'A wall that drifts next to the door can become your stopping point.', board:['S..#...','...#...','.......','..##E..','#......','.....##','#....#.']},
  {name:'Change direction', prompt:'Plan one move at a time. The board after this move is a new puzzle.', board:['S#.....','.....##','...#.#.','..#.E.#','.......','.......','...#...']},
  {name:'A useful detour', prompt:'If the route closes, look for the wall that just arrived.', board:['S......','.###.#.','#......','....E#.','.......','.......','..#....']}
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
