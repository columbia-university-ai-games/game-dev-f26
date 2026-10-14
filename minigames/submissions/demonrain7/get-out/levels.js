(function(root){
 const levels = [
  {name:'Find your feet', prompt:'A wall can give you somewhere to stop.', board:['S#.#..#','.....#.','#.##...','....E..','....#..','..#.#..','#....#.']},
  {name:'Take the long way', prompt:'Being near the door is only part of the problem.', board:['S..#...','...#...','.......','..##E..','#......','.....##','#....#.']},
  {name:'Change direction', prompt:'Which stopping point opens a new route?', board:['S#.....','.....##','...#.#.','..#.E.#','.......','.......','...#...']},
  {name:'A useful detour', prompt:'Make a prediction before each move.', board:['S......','.###.#.','#......','....E#.','.......','.......','..#....']}
 ];
 const curriculum = [
  {spawnMoves:3,tilesPerSecond:2},
  {spawnMoves:2,tilesPerSecond:3},
  {spawnMoves:1,tilesPerSecond:4},
  {spawnMoves:1,tilesPerSecond:5}
 ];
 for (const [i, level] of levels.entries()) level.difficulty = curriculum[i];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
