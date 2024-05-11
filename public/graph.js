// Bug noticed: when scaling the graph, sometimes the last ticks disappear on the axes.
// Bug: Points plotted offset from cursor

let X_STEP = 25;
let Y_STEP = 25;
let X_SUBSTEP = 5;
let Y_SUBSTEP = 5;
let X_RANGE = [-50, 100];
let Y_RANGE = [-50, 100];
const GRAPH_PADDING = 20;
let x_substepPixels, x_stepPixels, y_axisPos, y_substepPixels, y_stepPixels, x_axisPos;

let debug = true; //for debug

let points = [];

function setup() {
    createCanvas(windowWidth*0.75, windowHeight-200);
    background(235, 235, 235);
    textAlign(CENTER, CENTER);
}

function draw() {
    //axis lines
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

let workspaceKeyStatuses = {
    'p': false
};

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

                        a = (len(points)*cp-sx*sy)/(len(points)*sx2-sx*sx)
                        b = (sy/len(points))-a*(sx/len(points))
                        ans = str(a)+"x"+str(b)
                `)
                m = pyodide.globals.toJs().get('a');
                b = pyodide.globals.toJs().get('b');
            }
            catch (err) {
                console.log(err);
            }
        }

        addPython().then(() => {
            let x_left = X_STEP*((0-y_axisPos)/x_stepPixels);
            let y_left = m*x_left+b;
            let x_right = X_STEP*((width-y_axisPos)/x_stepPixels);
            let y_right = m*x_right+b;
            let conversionFactor = y_stepPixels/Y_STEP;

            console.log(x_left, y_left, x_right, y_right, conversionFactor);
            console.log(0, y_left*conversionFactor+x_axisPos, width, y_right*conversionFactor+x_axisPos);

            strokeWeight(3);
            line(0, x_axisPos-y_left*conversionFactor, width, x_axisPos-y_right*conversionFactor);
        });
    }
}

function mouseClicked() {
    //plot point
    if(workspaceKeyStatuses['p']) {
        fill('black');
        circle(mouseX, mouseY, 5);
        points.push([X_STEP*((mouseX-y_axisPos)/x_stepPixels), Y_STEP*(-(mouseY-x_axisPos)/y_stepPixels)]);
    }
}