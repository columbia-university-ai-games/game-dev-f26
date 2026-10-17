(function(root){
 const levels = [
  {name:'A door that does not help', prompt:'The blue portal is close to you. Does it help this route?', board:['S..','.#.','#.E'], portals:[{entry:[1,1],exit:[2,0]}]},
  {name:'The only way through', prompt:'The blue entrance is the only way across the wall. Which direction will carry you through?', board:['##S##','##.##','#####','.....','....E'], portals:[{entry:[2,2],exit:[2,3]}]},
  {name:'A useful route and a bad detour', prompt:'One pair is required. Entering the pink pair sends you back toward the upper passage, so you must route through the blue pair again.', board:['##S##','##.#.','#####','.#...','#.#.E'], portals:[{entry:[2,2],exit:[2,3]},{entry:[3,1],exit:[1,3]}]}
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
