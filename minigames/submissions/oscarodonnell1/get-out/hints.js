/* Optional help. The rules and solver remain in engine.js. */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports)module.exports=factory(require('./engine.js'));
  else root.GetOutHints=factory(root.GetOut);
})(globalThis,function(game){
  'use strict';
  const arrows={up:'↑',right:'→',down:'↓',left:'←'};
  const directions={up:[-1,0],right:[0,1],down:[1,0],left:[0,-1]};

  function reveal(state,shown){
    if(state.won||shown.length>=3)return shown;
    const path=game.solve(state);
    let sequence;
    if(path===null){
      sequence=[
        {kind:'question',message:'Could revisiting an earlier choice help you find a different route?'},
        {kind:'clue',message:'There is no route to the exit from this position.',unreachable:true},
        {kind:'recovery',message:'Undo a move or Reset, then try another route.'}
      ];
    }else{
      const action=path[0],next=game.step(state,action);
      const exitRow=state.board.findIndex(row=>row.includes('E'));
      const exitColumn=state.board[exitRow].indexOf('E');
      let question='Which wall or edge could give you a useful place to stop and change direction?';
      let clue;
      if(path.length===1){
        question='Could one straight slide take you through the exit from here?';
        clue=`The exit is reachable along your current ${state.position[0]===exitRow?'row':'column'}.`;
      }else if(next.position[0]===exitRow){
        clue="Look for a stopping place in the exit's row. It is part of a route out.";
      }else if(next.position[1]===exitColumn){
        clue="Look for a stopping place in the exit's column. It is part of a route out.";
      }else{
        const [dr,dc]=directions[action],r=next.position[0]+dr,c=next.position[1]+dc;
        clue=r<0||r>=state.board.length||c<0||c>=state.board[0].length
          ?'The outside edge can give you the next useful stopping point.'
          :`Look at the wall in row ${r+1}, column ${c+1}, counting from the top left. It can help you stop and turn.`;
      }
      sequence=[{kind:'question',message:question},{kind:'clue',message:clue},
        {kind:'move',message:`Try ${arrows[action]} ${action}.`,action}];
    }
    return [...shown,{...sequence[shown.length],stage:shown.length+1}];
  }

  function afterMove(previous,next,shown){return next===previous?shown:[];}
  return {reveal,afterMove};
});
