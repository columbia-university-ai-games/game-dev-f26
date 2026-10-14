(function(root){
 const levels = [
  {name:'Find your feet', prompt:'A wall can give you somewhere to stop.', board:['S#.#..#','.....#.','#.##...','....E..','....#..','..#.#..','#....#.']},
  {name:'Take the long way', prompt:'Being near the door is only part of the problem.', board:['S..#...','...#...','.......','..##E..','#......','.....##','#....#.']},
  {name:'Change direction', prompt:'Which stopping point opens a new route?', board:['S#.....','.....##','...#.#.','..#.E.#','.......','.......','...#...']},
  {name:'A useful detour', prompt:'Make a prediction before each move.', board:['S......','.###.#.','#......','....E#.','.......','.......','..#....']},
  {name:'Break through', prompt:'The exit is sealed. Which ordinary-looking wall might open the route?', lesson:'break', mustBreak:[0,1], breakableWalls:[{row:0,column:1,minHits:1,maxHits:3}], board:['S#.##','....#','...#.','...#.','.#..E']},
  {name:'Keep your footing', prompt:'One fragile wall is also a necessary stopping point. Do not hit it twice.', lesson:'preserve', mustPreserve:[3,4], breakableWalls:[{row:3,column:4,minHits:2,maxHits:3}], board:['S..#..','...#.#','......','.#..#.','###..#','####.E']},
  {name:'Choose what changes', prompt:'Break the wall that blocks the route, but preserve the wall that lets you turn.', lesson:'combine', mustBreak:[3,5], mustPreserve:[5,2], breakableWalls:[{row:3,column:5,minHits:1,maxHits:3},{row:5,column:2,minHits:2,maxHits:3}], board:['S###.#','......','......','.#...#','...##.','..#.#E']}
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
