(function(root){
 const levels = [
  {name:'Find your feet', prompt:'A wall can give you somewhere to stop.', board:['S#.#..#','.....#.','#.##...','....E..','....#..','..#.#..','#....#.']},
  {name:'Take the long way', prompt:'Being near the door is only part of the problem.', board:['S..#...','...#...','.......','..##E..','#......','.....##','#....#.']},
  {name:'Change direction', prompt:'Which stopping point opens a new route?', board:['S#.....','.....##','...#.#.','..#.E.#','.......','.......','...#...']},
  {name:'A useful detour', prompt:'Make a prediction before each move.', board:['S......','.###.#.','#......','....E#.','.......','.......','..#....']},
  {"name":"Chase: Corner sprint","prompt":"Get a feel for the chase: you slide, but the chaser takes just one floor step.","board":["S....",".....","..#..",".....","....E"]},
  {"name":"Chase: Ring road","prompt":"Which corner is safe? Watch the chaser before committing to a long slide.","board":["S......",".#####.",".#...#.",".#.#.#.",".#...#.",".#####.","...E..."]},
  {"name":"Chase: Close quarters","prompt":"Plan your stopping points. The chaser is close, and every third turn it wanders.","board":["S.#.#.#",".......","......#",".#..E.#","......#","..#....","##.#..."]}
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
