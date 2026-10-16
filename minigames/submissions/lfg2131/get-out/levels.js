/* Ten challenge boards; design rationale and verified paths: puzzle-design.md. */
(function(root){
 const levels = [
  {
   name: "Beyond the door",
   prompt: "A useful stopping point may be farther from the door.",
   board: [
    "#......",
    ".####..",
    "..#...#",
    "..E....",
    ".......",
    ".......",
    "S....#."
   ]
  },
  {
   name: "Offset approach",
   prompt: "Compare where each slide can end.",
   board: [
    "..#....",
    ".....##",
    ".#.....",
    ".......",
    ".......",
    "...E.#S",
    ".....#."
   ]
  },
  {
   name: "The far edge",
   prompt: "Plan where a slide ends, as well as where it passes.",
   board: [
    "S...#..",
    ".......",
    ".E.....",
    ".....#.",
    ".....#.",
    ".....#.",
    ".....#."
   ]
  },
  {
   name: "Change the angle",
   prompt: "Think about the slide after the next one.",
   board: [
    ".....#.",
    ".E.....",
    "...#...",
    ".##....",
    ".#.....",
    ".#..#..",
    "S.#.#.."
   ]
  },
  {
   name: "Lower crossing",
   prompt: "Nearness and alignment can suggest different plans.",
   board: [
    "........",
    ".#....#.",
    ".#..E...",
    ".#......",
    ".....#..",
    "........",
    "....#..S",
    "#...#..."
   ]
  },
  {
   name: "Parallel routes",
   prompt: "Which stops will still matter two slides from now?",
   board: [
    "#......#",
    "........",
    "....#...",
    "......#.",
    "......#.",
    "......#.",
    ".E...#..",
    ".....#.S"
   ]
  },
  {
   name: "The distant setup",
   prompt: "Look for a chain of useful stopping points.",
   board: [
    "S.......",
    ".#.E.#..",
    ".#...#..",
    "##...#..",
    ".#......",
    ".#.....#",
    "..#.....",
    "..#.#..."
   ]
  },
  {
   name: "Two circuits",
   prompt: "Predict a few stopping points before committing.",
   board: [
    ".........",
    ".........",
    "#........",
    "..E...#.#",
    "...#..#..",
    "...#..#..",
    "...#.....",
    "..#...##.",
    "..#....S."
   ]
  },
  {
   name: "Before the last turn",
   prompt: "An open lane is only useful if you can enter it.",
   board: [
    "S.#......",
    ".........",
    "......#.#",
    "...#..#..",
    ".........",
    ".......#.",
    "...##....",
    "#..#...E.",
    "...#....."
   ]
  },
  {
   name: "Think before you peek",
   prompt: "Plan how the last approach could become possible.",
   board: [
    ".#..#..S",
    "..###...",
    ".E....##",
    "........",
    ".###....",
    ".......#",
    "........",
    "....#..."
   ]
  }
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
