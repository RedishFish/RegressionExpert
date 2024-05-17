// Bug noticed: when scaling the graph, sometimes the last ticks disappear on the axes.
// Bug: Points plotted offset from cursor - solved, need even diameter

let X_STEP = 25;
let Y_STEP = 25;
let X_SUBSTEP = 5;
let Y_SUBSTEP = 5;
let X_RANGE = [-50, 100];
let Y_RANGE = [-25, 100];
const GRAPH_PADDING = 20;
let x_substepPixels, x_stepPixels, y_axisPos, y_substepPixels, y_stepPixels, x_axisPos;
let x_conversionFactor, y_conversionFactor;

let debug = true; //for debug
console
let points = [];

let pts = [];
let cur = "";
let pair = [];
let id = localStorage.getItem('points');
if(id != null){
    for(let i = 0; i < id.length; i++){
      if(id[i] != '(' && id[i] != ')' && id[i] != ','){
        cur += id[i];
      }
      if(id[i] == ','){
        pair.push(parseFloat(cur));
        cur = "";
      }
      if(id[i] == '('){
        if(pair.length != 0){
          pts.push(pair);
          pair = [];
        }
      }
    }
}
if(pair.length != 0){
  pts.push(pair);
  pair = [];
}
points = pts;

let titleEl = document.getElementsByClassName("graph-title-input")[0];
titleEl.value = localStorage.getItem("graph-name");
document.getElementById('origPoints').value = id;
document.getElementById('origName').value = titleEl.value;

let lines = [];
id = localStorage.getItem('lines');
cur = "";
pair = [];
if(id != null){
    for(let i = 0; i < id.length; i++){
      if(id[i] != '(' && id[i] != ')' && id[i] != ','){
        cur += id[i];
      }
      if(id[i] == ','){
        pair.push(parseFloat(cur));
        cur = "";
      }
      if(id[i] == '('){
        if(pair.length != 0){
          lines.push({m: pair[0], b: pair[1]});
          pair = [];
        }
      }
    }
}
if(pair.length != 0){
  lines.push({m: pair[0], b: pair[1]});
  pair = [];
}

let selectedPoints = [];
let selectedLines = [];

let workspaceKeyStatuses = {
    'p': false,
    'd': false,
    's': false
};

function setup() {
    createCanvas(windowWidth*0.75, windowHeight-200);
    background(245);
    textAlign(CENTER, CENTER);
}
  
function draw() {
    background(245);
    document.getElementById('user').value = localStorage.getItem('username');
    let pointStr = "";
    for(let i = 0; i < points.length; i++){
        pointStr += "(";
        pointStr += points[i][0].toFixed(2);
        pointStr += ",";
        pointStr += points[i][1].toFixed(2);
        pointStr += "),";
    }
    let lineStr = "";
    for(let i = 0; i < lines.length; i++){
        lineStr += "(";
        lineStr += lines[i]['m'].toFixed(2);
        lineStr += ",";
        lineStr += lines[i]['b'].toFixed(2);
        lineStr += "),";
    }
    document.getElementById('points').value = pointStr;
    document.getElementById('lines').value = lineStr;
    // Axis lines
    x_substepPixels = (width-GRAPH_PADDING*2)/((X_RANGE[1]-X_RANGE[0])/X_SUBSTEP);
    x_stepPixels = (width-GRAPH_PADDING*2)/((X_RANGE[1]-X_RANGE[0])/X_STEP);
    y_axisPos = GRAPH_PADDING + x_substepPixels*(-X_RANGE[0]/X_SUBSTEP);
    y_substepPixels = (height-GRAPH_PADDING*2)/((Y_RANGE[1]-Y_RANGE[0])/Y_SUBSTEP);
    y_stepPixels = (height-GRAPH_PADDING*2)/((Y_RANGE[1]-Y_RANGE[0])/Y_STEP);
    x_axisPos = GRAPH_PADDING + y_substepPixels*(Y_RANGE[1]/Y_SUBSTEP);

    //console.log("dimensions: " + width + ", " + height);
    //console.log("origin: " + x_axisPos + ", " + y_axisPos);
    strokeWeight(2);
    line(y_axisPos, 0, y_axisPos, height);
    line(0, x_axisPos, width, x_axisPos);

    // Tick-marks, tick labels, and grid lines 
    for(let x = GRAPH_PADDING; x <= width-GRAPH_PADDING; x += x_substepPixels){
        // Grid line
        stroke(128, 128, 128, 30);
        strokeWeight(1);
        line(x, 0, x, height);

        stroke('black');
        if(Math.round((x-GRAPH_PADDING) % x_stepPixels) == 0 || Math.round((x-GRAPH_PADDING) % x_stepPixels) == Math.round(x_stepPixels)){ //main tick
            strokeWeight(2);
            line(x, x_axisPos-10, x, x_axisPos+10);
            if(Math.abs(x-y_axisPos) > 0.1){
                strokeWeight(.2);
                text(X_STEP*Math.round((x-y_axisPos)/x_stepPixels), x, x_axisPos-20);
            }
        }
        else{ //subtick
            strokeWeight(1);
            line(x, x_axisPos-5, x, x_axisPos+5);
        }
    }

    for(let y = GRAPH_PADDING; y <= height-GRAPH_PADDING; y += y_substepPixels){
        /**
        if(debug){
            console.log(`${y-GRAPH_PADDING}, ${y_stepPixels}, ${Math.round((y-GRAPH_PADDING) % y_stepPixels) % y_stepPixels}`);
        }**/

        // Grid line
        stroke(128, 128, 128, 30);
        strokeWeight(1);
        line(0, y, width, y);

        stroke('black');
        if(Math.round((y-GRAPH_PADDING) % y_stepPixels) == 0 || Math.round((y-GRAPH_PADDING) % y_stepPixels) == Math.round(y_stepPixels)){ //main tick
            strokeWeight(2);
            line(y_axisPos-10, y, y_axisPos+10, y);
            if(Math.abs(y-x_axisPos) > 0.1){
                strokeWeight(.2);
                text(Y_STEP*Math.round(-(y-x_axisPos)/y_stepPixels), y_axisPos-30, y);
            }
        }
        else{ //subtick
            strokeWeight(1);
            line(y_axisPos-5, y, y_axisPos+5, y);
        }
    }

    x_conversionFactor = x_stepPixels/X_STEP;
    y_conversionFactor = y_stepPixels/Y_STEP;
    // Points
    for(let point of points){
        if(selectedPoints.includes(point)) {
            stroke("red");
            fill("red");
            circle(y_axisPos+point[0]*x_conversionFactor, x_axisPos-point[1]*y_conversionFactor, 10);
        }
        stroke("black");
        fill('black');
        circle(y_axisPos+point[0]*x_conversionFactor, x_axisPos-point[1]*y_conversionFactor, 6);
    }
    stroke("black");
    fill("black");

    // Lines
    for(let i = 0; i < lines.length; i++){
        let x_left = X_STEP*((0-y_axisPos)/x_stepPixels);
        let y_left = lines[i].m*x_left+lines[i].b;
        let x_right = X_STEP*((width-y_axisPos)/x_stepPixels);
        let y_right = lines[i].m*x_right+lines[i].b;

        //console.log(x_left, y_left, x_right, y_right, conversionFactor);
        //console.log(0, y_left*conversionFactor+x_axisPos, width, y_right*conversionFactor+x_axisPos);

        strokeWeight(2);
        line(0, x_axisPos-y_left*y_conversionFactor, width, x_axisPos-y_right*y_conversionFactor);
    }
    
    debug = false;
}

function windowResized() {
    resizeCanvas(windowWidth*0.75, windowHeight-200);
    background(240);
}

function keyPressed() {
    if(key === 'p') {
        if(!workspaceKeyStatuses['p']){
            cursor(CROSS);
            workspaceKeyStatuses['p'] = true;
        }
        else{
            cursor(ARROW);
            workspaceKeyStatuses['p'] = false;
        }
    }

    if(key === 'd') {
        for(let i = 0; i < selectedPoints.length; i++) {
            points.splice(points.indexOf(selectedPoints[i]), 1);
        }
        selectedPoints = [];
    }

    if(key === 's'){
        ;
    }

    //for testing only - portion copied from linearReg.html
    if(key === 'n') {
        // init Pyodide
        async function main() {
            let pyodide = await loadPyodide();
            return pyodide;
        }
        let pyodideReadyPromise = main();

        let m, b;
        async function addPython(){
            let pyodide = await pyodideReadyPromise;
            try {
                // in this array one can type Python
                pyodide.globals.set("points", points);
                let output = pyodide.runPython(`
                    for i in points:
                        cp = 0
                        sx = 0
                        sx2 = 0
                        sy = 0

                        for i in range(len(points)):
                            cp += points[i][0]*points[i][1]
                            sx += points[i][0]
                            sx2 += points[i][0]*points[i][0]
                            sy += points[i][1]
                        
                        m = (len(points)*cp-sx*sy)/(len(points)*sx2-sx*sx)
                        b = (sy/len(points))-m*(sx/len(points))
                `)
                m = pyodide.globals.toJs().get('m');
                b = pyodide.globals.toJs().get('b');
            }
            catch (err) {
                console.log(err);
            }
        }

        addPython().then(() => {
            lines.push({'m': m, 'b': b});
        });
    }
}

function mouseClicked() {
    //plot point
    if (workspaceKeyStatuses['p']) {
        points.push([X_STEP*((mouseX-y_axisPos)/x_stepPixels), Y_STEP*(-(mouseY-x_axisPos)/y_stepPixels)]);
    }
    else {
        for(let i = 0; i < points.length; i++){
            let d = Math.sqrt(((y_axisPos+points[i][0]*x_conversionFactor)-mouseX)**2 + ((x_axisPos-points[i][1]*y_conversionFactor)-mouseY)**2) - 3;
            if(d < 1) {
                if(selectedPoints.includes(points[i])){
                    selectedPoints.splice(selectedPoints.indexOf(points[i]), 1);
                }
                else{
                    selectedPoints.push(points[i]);
                    console.log(selectedPoints);
                }
                break; //only want to select oppne point at a time
            }
        }
    }
}

function goHome(){
    localStorage.removeItem("graph-name");
    localStorage.removeItem("points");
    window.location.href = 'home';
}
