(function(root){
 const levels = [
  {"name":"Stop, then pass","prompt":"Move right: stop before the cracked wall and watch it disappear. Move right again to pass through.","board":["S.FE","####"]},
  {"name":"A place to turn","prompt":"Use the cracked wall to stop beside the exit, then turn downward. A vanished wall is now floor.","board":["S.F.","#E.."]},
  {"name":"Two walls, two stops","prompt":"Each cracked wall stops you once. Before moving again, predict which wall you will meet next.","board":["S.F.FE","######"]},
  {"name":"Stop, turn, continue","prompt":"Let one cracked wall line up your turn; use the other to pause, then continue. Undo restores a stopping point if you need it.","board":["S..F.","##.##","..F.E","#####"]},
  {"name":"Three useful walls","prompt":"Three cracked walls, three choices about stopping and continuing. Work out your approach; Undo is available for experiments.","board":["S.#..","...F.","..#F.","...EF","....."]},
  {name:'The other side', prompt:'The exit is beside the cracked wall. Where will you need to stop before approaching it?', board:['..#...#','.S#.#..','.....#.','....FE.','..##...','.....##','.#..##.']},
  {name:'A changed route', prompt:'A passage opens, but a stopping point disappears. Predict both before using the cracked wall.', board:['....#..','.S...#.','.#..##.','#..F.E.','....#..','..#...#','..#....']},
  {name:'Keep your foothold', prompt:'A cracked wall can be worth keeping. Undo is available if a stopping point is lost.', board:['.......','.S.F...','...#..#','##..#E#','.......','.##..#.','......#']},
  {name:'The wrong approach', prompt:'Before using the cracked wall, consider which side you will need to approach from. Undo lets you investigate.', board:['.....#.','#S.#..#','.......','.#..#E#','..F#...','.......','...##..']}
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
