(function(root){
 const levels = [
  {name:'Find your feet', prompt:'A wall can give you somewhere to stop.', board:['S#.#..#','.....#.','#.##...','....E..','....#..','..#.#..','#....#.']},
  {name:'Take the long way', prompt:'Being near the door is only part of the problem.', board:['S..#...','...#...','.......','..##E..','#......','.....##','#....#.']},
  {name:'Change direction', prompt:'Which stopping point opens a new route?', board:['S#.....','.....##','...#.#.','..#.E.#','.......','.......','...#...']},
  {name:'A useful detour', prompt:'Make a prediction before each move.', board:['S......','.###.#.','#......','....E#.','.......','.......','..#....']},
  {name:'Around the corner', prompt:'A short route may need a change of direction.', board:['S..#...','...#...','..#....','....#E.','.#.....','.......','...#...']},
  {name:'Find a stopping point', prompt:'Where can a wall help you line up with the exit?', board:['S#.....','.......','..##...','.......','...#..E','.......','.#.....']},
  {name:'A clear opening', prompt:'Sometimes one well chosen slide is enough.', board:['S......','.#.##..','.......','...#...','..##...','.......','....E..']}
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
