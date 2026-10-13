(function(root){
 const levels = [
  {
    "name": "Give it a push",
    "prompt": "Push the orange wall right, then find the door. A push stops you in its old square.",
    "board": [
      "S.W..",
      "##.##",
      "..E.."
    ]
  },
  {
    "name": "Make a stopping point",
    "prompt": "A wall can block a route or give you somewhere useful to stop. Which push helps?",
    "board": [
      "S#.#.",
      "..W..",
      "..E..",
      ".....",
      "#...."
    ]
  },
  {
    "name": "Think before you push",
    "prompt": "Two movable walls, one exit. Can you keep a route open? Undo is available.",
    "board": [
      "S....",
      ".#W..",
      "##E..",
      ".W...",
      "....."
    ]
  }
];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
