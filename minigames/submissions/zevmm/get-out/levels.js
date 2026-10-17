(function(root){
 const levels = [
 {name:'Walls on the move', prompt:'Walls drift slowly. Move around an orange wall and bump it from another side while it moves. Dark walls stay fixed.', board:['#.....E','.......','..M....','..S....','.......']},
  {name:'Find your feet', prompt:'A wall can give you somewhere to stop.', board:['S#.#..#','.....#.','#.##...','....E..','....#..','..#.#..','#....#.']},
  {name:'Take the long way', prompt:'Being near the door is only part of the problem.', board:['S..#...','...#...','.......','..##E..','#......','.....##','#....#.']},
  {name:'Change direction', prompt:'Which stopping point opens a new route?', board:['S#.....','.....##','...#.#.','..#.E.#','.......','.......','...#...']},
  {name:'A useful detour', prompt:'Make a prediction before each move.', board:['S......','.###.#.','#......','....E#.','.......','.......','..#....']},
  {name:'Level 1', prompt:'What route can you open with the sliding wall?', board:['SM.....','.###E..','.#.....','....#..','.......','...#...','...#...']},
  {name:'Level 2', prompt:'Where will the wall give you a useful stopping point?', board:['.#...#.','SM...#.','####...','.......','.......','.E.....','.......']},
  {name:'Level 3', prompt:'Watch the wall and choose when to change direction.', board:['SM....#','.#....E','.#..#.#','.#..#.#','....#.#']},
  {name:'Level 4', prompt:'How can you use the moving wall to line up with the exit?', board:['......#','......#','......E','S.M...#','....###']}
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
