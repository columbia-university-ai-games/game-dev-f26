(function(root){
 const levels = [
  {name:'Learn the order', prompt:'Touch 1, then 2, then 3, then 4. Any other number ends the run.', board:['S.....1','.....#.','..##...','4...#..','....#..','..#.#..','3.....2']},
  {name:'Keep your route', prompt:'The numbered exits stop a slide. Plan which direction reaches the next number.', board:['S.....1','...#...','.......','4.##...','.......','.....#.','3.....2']},
  {name:'Read the corners', prompt:'Only the next number is safe. A repeated exit is out of order too.', board:['S.....1','.....#.','...#.#.','4.#..#.','.......','.......','3.....2']},
  {name:'Four in sequence', prompt:'Reach every numbered exit exactly in order to win.', board:['S.....1','.###.#.','.......','4....#.','.......','.......','3.....2']}
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
