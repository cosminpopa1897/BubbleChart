
window.onload = function(){
var canvas = document.getElementById("BubbleChart");
canvas.width = 800;
canvas.height = 600;

var ctx = canvas.getContext("2d");

var scores = [100, 90, 85, 45, 72, 88];
scores.reverse();
var width = 50;
var currX = 0;

ctx.translate(375, 200);
 ctx.rotate(Math.PI);

ctx.fillStyle = 'green';
for (var i = 0; i<scores.length; i++){
    ctx.fillRect(currX, 0 , width, scores[i])
    currX += width+10;
}


}