(function(root){
 const levels = [
  {
    "name": "Push your way out",
    "prompt": "Push the orange block to make a new stopping point.",
    "board": [
      "SB..",
      "##E#"
    ]
  },
  {
    "name": "Make a stopping point",
    "prompt": "Which block can help you turn toward the exit?",
    "board": [
      "..#.B.",
      "....E.",
      "......",
      "##.###",
      ".SB.##",
      ".....#"
    ]
  },
  {
    "name": "Around the block",
    "prompt": "A block near the door may need a detour.",
    "board": [
      "....#",
      "E..BS",
      "....#",
      ".....",
      "..B#."
    ]
  },
  {
    "name": "A useful detour",
    "prompt": "Plan where the block will stop before you push.",
    "board": [
      ".S.#..",
      "#.B.#.",
      "....E#",
      "...#.#",
      "....#.",
      "B....."
    ]
  },
  {
    "name": "Change the route",
    "prompt": "Changing the board can open a new route.",
    "board": [
      "....B",
      ".....",
      ".....",
      "#E.B.",
      "....S"
    ]
  },
  {
    "name": "Three-block tangle",
    "prompt": "Choose which block to move first.",
    "board": [
      "#..BS.",
      "B...#.",
      "....E.",
      ".#....",
      "....#.",
      "B...#."
    ]
  },
  {
    "name": "Return with a plan",
    "prompt": "Returning to a square can reveal a different route.",
    "board": [
      "#....#",
      "..S#..",
      "..B...",
      "......",
      ".....#",
      "##E#.."
    ]
  },
  {
    "name": "The long loop",
    "prompt": "Think beyond your next stopping point.",
    "board": [
      "..S#..",
      ".B.#..",
      "..#E..",
      "......",
      ".#....",
      "..#..#"
    ]
  },
  {
    "name": "Rearrange your options",
    "prompt": "Keep track of what each push changes.",
    "board": [
      ".....",
      "B.#..",
      ".BE..",
      "S.#..",
      "....#"
    ]
  },
  {
    "name": "One final escape",
    "prompt": "Combine pushing, detours, and careful stopping.",
    "board": [
      "....#.",
      "##....",
      "....#S",
      "..#B..",
      "#E#..#",
      "..####"
    ]
  }
];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
