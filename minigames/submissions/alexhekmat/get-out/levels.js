(function(root){
 const levels = [
  {name:'Find your feet', prompt:'Walls switch first. Where will your ball stop this turn?', board:['S*.*..#','.....*.','#.#*...','....E..','....*..','..#.*..','#....*.']},
  {name:'Take the long way', prompt:'Being near the door is only part of the problem.', board:['S..*...','...*...','.......','..##E..','*......','.....##','#....*.']},
  {name:'Change direction', prompt:'Which stopping point opens a new route?', board:['S*.....','.....##','...*.*.','..*.E.#','.......','.......','...*...']},
  {name:'A useful detour', prompt:'Make a prediction before each move.', board:['S......','.##*.*.','*......','....E*.','.......','.......','..*....']}
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
