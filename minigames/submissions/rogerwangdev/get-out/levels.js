(function(root){
 const levels = [
  {
    "name": "Make some room",
    "prompt": "Push the striped block to open your route. Each slide or push costs one move.",
    "board": [
      "S..B.",
      "....#",
      ".#...",
      "##.#.",
      "###.E"
    ]
  },
  {
    "name": "The final rearrangement",
    "prompt": "Push the striped block to open your route. Each slide or push costs one move.",
    "board": [
      "S..B.",
      ".##..",
      ".....",
      "..#..",
      "...#E"
    ]
  },
  {
    "name": "Turn the corner",
    "prompt": "Push the striped block to open your route. Each slide or push costs one move.",
    "board": [
      "SB...",
      "#....",
      "##...",
      "###.#",
      ".#..E"
    ]
  },
  {
    "name": "Build a stopping point",
    "prompt": "Push the striped block to open your route. Each slide or push costs one move.",
    "board": [
      "S.#..",
      "#....",
      "#..##",
      ".#B..",
      "....E"
    ]
  }
];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
