(function(root){
 const levels = [
    {name:'Cross traffic', prompt:'A moves sideways. B moves vertically. Borrow a stopping point from each.',
      board:['S.#.#..','..#.E..','#......','...#...','.......','...#.##','.......'],
      movers:[
        {path:[[4,0],[4,1],[4,2],[4,3]],index:1,direction:1},
        {path:[[1,6],[2,6],[3,6]],index:1,direction:1}
      ]},
    {name:'Three-way timing', prompt:'Three walls, one turn. Holding one wall in place lets the other two catch up.',
      board:['S#.#.##','.E###.#','.......','#......','....#..','.#.....','.##..##'],
      movers:[
        {path:[[2,3],[3,3],[4,3]],index:2,direction:-1},
        {path:[[5,2],[5,3],[5,4],[5,5]],index:0,direction:1},
        {path:[[2,1],[3,1],[4,1]],index:1,direction:-1}
      ]},
    {name:'Clockwork maze', prompt:'Plan the next two stops. Every wall can become a brake at the right moment.',
      board:['S.#.....','#..#.##.','........','#.#..#..','..#...#.','.......#','##...E#.','.##.....'],
      movers:[
        {path:[[2,2],[2,3],[2,4],[2,5]],index:1,direction:1},
        {path:[[1,1],[2,1],[3,1],[4,1]],index:0,direction:-1},
        {path:[[5,0],[5,1],[5,2]],index:1,direction:1}
      ]}
 ];
 const hunts=[
   {source:0,name:'Borrowed shelter',monster:[4,0],prompt:'A can shelter you from the hunter. Make a stopping point, then let the gate close.'},
   {source:1,name:'Crossed signals',monster:[5,4],prompt:'A hunter can hold a gate too. Lure it toward a rail, then change direction.'},
   {source:2,name:'The last corridor',monster:[5,5],prompt:'Use all three gates. Watch the hunter before waiting; the shortest slide may be unsafe.'}
 ];
 levels.forEach(level=>level.mode='practice');
 for(const hunt of hunts){
   const base=levels[hunt.source];
   levels.push({name:hunt.name,prompt:hunt.prompt,mode:'hunt',board:base.board.slice(),
     movers:base.movers.map(m=>({path:m.path.map(p=>p.slice()),index:m.index,direction:m.direction})),monster:hunt.monster});
 }
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
