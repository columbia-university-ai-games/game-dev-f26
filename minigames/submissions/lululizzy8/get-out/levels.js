(function(root){
 const levels = [
  {name:'Find your feet', prompt:'A wall can give you somewhere to stop.', board:['S#.#..#','.....#.','#.##...','....E..','....#..','..#.#..','#....#.']},
  {name:'Take the long way', prompt:'Being near the door is only part of the problem.', board:['S..#...','...#...','.......','..##E..','#......','.....##','#....#.']},
  {name:'Cracks behind you', prompt:'The quick way back crosses your own tracks.', board:['......#','..#....','..#.#..','.E##...','...S...','....##.','..#..#.']},
  {name:'No way back', prompt:'Plan the whole route before the ice decides for you.', board:['...#...','.......','..#....','....#..','.E.....','.#..#S#','......#']}
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
