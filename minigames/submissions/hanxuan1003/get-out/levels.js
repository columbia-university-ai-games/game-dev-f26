(function(root){
 const levels = [
 {name:'Learn the switch',prompt:'Cross T to open A. The change happens during your slide.',board:['STAE','####']},
 {name:'A useful closed door',prompt:'An open door is a route. Can a closed door help you stop?',board:['.......','##.....','.B...##','..#.TA.','...E...','.....A#','#.....S']},
 {name:'My classroom original',prompt:'The original screenshot board, preserved for comparison. No switches here.',board:['.......','##.....','.....##','..#....','...E...','......#','#.....S']}
 ];
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.GetOutLevels=levels;
})(globalThis);
