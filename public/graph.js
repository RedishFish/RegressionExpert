// Bug noticed: when scaling the graph, sometimes the last ticks disappear on the axes

let X_STEP = 25;
let Y_STEP = 25;
let X_SUBSTEP = 5;
let Y_SUBSTEP = 5;
let X_RANGE = [-50, 100];
let Y_RANGE = [-50, 100];
const GRAPH_PADDING = 20;
let debug = true; //for debug

function setup() {
    createCanvas(windowWidth*0.75, windowHeight-200);
    background(235, 235, 235);
    textAlign(CENTER, CENTER);
}
  
function draw() {
    //axis lines
    let x_substepPixels = (width-GRAPH_PADDING*2)/((X_RANGE[1]-X_RANGE[0])/X_SUBSTEP);
    let x_stepPixels = (width-GRAPH_PADDING*2)/((X_RANGE[1]-X_RANGE[0])/X_STEP);
    let y_axisPos = GRAPH_PADDING + x_substepPixels*(-X_RANGE[0]/X_SUBSTEP);
    let y_substepPixels = (height-GRAPH_PADDING*2)/((Y_RANGE[1]-Y_RANGE[0])/Y_SUBSTEP);
    let y_stepPixels = (height-GRAPH_PADDING*2)/((Y_RANGE[1]-Y_RANGE[0])/Y_STEP);
    let x_axisPos = GRAPH_PADDING + y_substepPixels*(Y_RANGE[1]/Y_SUBSTEP);

    //console.log("dimensions: " + width + ", " + height);
    //console.log("origin: " + x_axisPos + ", " + y_axisPos);

    strokeWeight(2);
    line(y_axisPos, 0, y_axisPos, height);
    line(0, x_axisPos, width, x_axisPos);

    //tick-marks and tick labels
    for(let x = GRAPH_PADDING; x <= width-GRAPH_PADDING; x += x_substepPixels){
        if(Math.round((x-GRAPH_PADDING) % x_stepPixels) == 0 || Math.round((x-GRAPH_PADDING) % x_stepPixels) == Math.round(x_stepPixels)){ //main tick
            strokeWeight(1);
            line(x, x_axisPos-10, x, x_axisPos+10);
            if(Math.abs(x-y_axisPos) > 0.1){
                text(X_STEP*Math.round((x-y_axisPos)/x_stepPixels), x, x_axisPos-20);
            }
        }
        else{ //subtick
            strokeWeight(0.5);
            line(x, x_axisPos-5, x, x_axisPos+5);
        }
    }

    for(let y = GRAPH_PADDING; y <= height-GRAPH_PADDING; y += y_substepPixels){
        /**
        if(debug){
            console.log(`${y-GRAPH_PADDING}, ${y_stepPixels}, ${Math.round((y-GRAPH_PADDING) % y_stepPixels) % y_stepPixels}`);
        }**/
        if(Math.round((y-GRAPH_PADDING) % y_stepPixels) == 0 || Math.round((y-GRAPH_PADDING) % y_stepPixels) == Math.round(y_stepPixels)){ //main tick
            strokeWeight(1);
            line(y_axisPos-10, y, y_axisPos+10, y);
            if(Math.abs(y-x_axisPos) > 0.1){
                text(Y_STEP*Math.round(-(y-x_axisPos)/y_stepPixels), y_axisPos-30, y);
            }
        }
        else{ //subtick
            strokeWeight(0.5);
            line(y_axisPos-5, y, y_axisPos+5, y);
        }
    }

    debug = false;
}

function windowResized() {
    resizeCanvas(windowWidth*0.75, windowHeight-200);
    background(235, 235, 235);
}