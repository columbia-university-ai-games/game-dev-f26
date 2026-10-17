(function(root){
 const levels=[
  {
    "name": "Find your feet",
    "prompt": "Every wall can be your floor. Predict your next landing before moving.",
    "board": [
      "S#.#..#",
      ".....#.",
      "#.##...",
      "....E..",
      "....#..",
      "..#.#..",
      "#....#."
    ]
  },
  {
    "name": "The useful detour",
    "prompt": "The exit needs a longer detour. Find the landing that opens the next passage.",
    "board": [
      "#######",
      "#..S#E#",
      "#..##.#",
      "#.#.#.#",
      "#.~...#",
      "#...#.#",
      "#######"
    ]
  },
  {
    "name": "Line up the fall",
    "prompt": "The exit sits at the bottom of a shaft. Which surface lets you line up above it?",
    "board": [
      "#######",
      "#.....#",
      "#.....#",
      "#.#...#",
      "#.#.#^#",
      "#S#E#.#",
      "#T#####"
    ]
  }
];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
