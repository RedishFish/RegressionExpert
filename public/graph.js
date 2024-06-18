/*
*    Author: Philip Xu, Luca Tu
*    Date: 2024/06/18
*    Description: Code that runs the interactive graph, powered by p5.js.
*/

// TODO: Could try to make it when zoom in/out scale changes dynamically (LOW PRIORITY)

// Confgurations for the graph (step, substep correspond to ticks, substicks intervals). Units are in graph units.
let X_STEP = 10;
let Y_STEP = 10;
let X_SUBSTEP = 5;
let Y_SUBSTEP = 5;
let X_RANGE = [-10, 100];
let Y_RANGE = [-10, 50];
const GRAPH_PADDING = 5;

let x_substepPixels,
    x_stepPixels,
    y_axisPos,
    y_substepPixels,
    y_stepPixels,
    x_axisPos;
let x_conversionFactor, y_conversionFactor;

let debug = true; //for debugging

let points = [];
let lines = [];
let selectedPoints = [];
let selectedLines = [];

let startDrag_X, startDrag_Y, endDrag_X, endDrag_Y;
let toDrag = false;

let workspaceKeyStatuses = {
    'p': false,
    'd': false,
    's': false,
    'x': false,
    'y': false,
    'n': false,
    "ctrl-z": false,
    "ctrl-shift-z": false,
};

/** Loading saved info and undo/redo features **/
// Code to load previously saved points
// Turns the string format of local storage into an array
let pts = [];
let cur = "";
let pair = [];
let id = localStorage.getItem("points");
if (id != null) {
    for (let i = 0; i < id.length; i++) {
        if (id[i] != "(" && id[i] != ")" && id[i] != ",") {
            cur += id[i];
        }
        if (id[i] == ",") {
            pair.push(parseFloat(cur));
            cur = "";
        }
        if (id[i] == "(") {
            if (pair.length != 0) {
                pts.push(pair);
                pair = [];
            }
        }
    }
}
if (pair.length != 0) {
    pts.push(pair);
    pair = [];
}
points = pts;

// Display saved title
let titleEl = document.getElementsByClassName("graph-title-input")[0];
titleEl.value = localStorage.getItem("graph-name");
document.getElementById("origPoints").value = id;
document.getElementById("origName").value = titleEl.value;

// Code to load previously saved lines
// Turns the string format of local storage into an array
id = localStorage.getItem("lines");
cur = "";
let num = ""
let nxt = [];

let curtype = "o";
if (id != null) {
    for (let i = 0; i < id.length; i++) {
        if(id[i] == 'l' || id[i] == 'p' || id[i] == 's' || id[i] == 'e' || id[i] == 'g'){
            if(curtype == 'l'){
                lines.push({"type": "linear", "m": nxt[0], "b": nxt[1], "string": `y = ${nxt[0].toPrecision(4)}x + ${nxt[1].toPrecision(4)}`});
            }
            if(curtype == 'p'){
                let res = `${nxt[0].toPrecision(4)}`;
                for(let i = 1; i < nxt.length; i++){
                    res = `${nxt[i].toPrecision(4)}x^${i} + ${res}`
                }
                lines.push({"type": "polynomial", "coeff": nxt, "string": res});
            }
            if(curtype == 's'){
                lines.push({"type": "sinusoidal", 'A': nxt[0], 'B': nxt[1], 'C': nxt[2], 'D': nxt[3], "string": `${nxt[0].toPrecision(4)}sin(${nxt[1].toPrecision(4)}x + ${nxt[2].toPrecision(4)}) + ${nxt[3].toPrecision(4)}`});
            }
            if(curtype == 'e'){
                lines.push({"type": "exponential", 'A': nxt[0], 'B': nxt[1], 'C': nxt[2], "string": `${nxt[0].toPrecision(4)}(${(Math.E**nxt[1]).toPrecision(4)}^x) + ${nxt[2].toPrecision(4)}`});
            }
            if(curtype == 'g'){
                lines.push({"type": "logarithmic", 'A': nxt[0], 'B': nxt[1], 'C': nxt[2], "string": `ln((x-${nxt[2].toPrecision(4)}) / ${nxt[0].toPrecision(4)}) / ${nxt[1].toPrecision(4)}`});
            }
            nxt = [];
            curtype = id[i];
        }
        else if(id[i] == '|'){
            nxt.push(parseFloat(num));
            num = "";
        }
        else num += id[i];
    }
}
// fill in the last entry
if(curtype == 'l'){
    lines.push({"type": "linear", "m": nxt[0], "b": nxt[1], "string": `y = ${nxt[0].toPrecision(4)}x + ${nxt[1].toPrecision(4)}`});
}
if(curtype == 'p'){
    let res = `${nxt[0].toPrecision(4)}`;
    for(let i = 1; i < nxt.length; i++){
        res = `${nxt[i].toPrecision(4)}x^${i} + ${res}`
    }
    lines.push({"type": "polynomial", "coeff": nxt, "string": res});
}
if(curtype == 's'){
    lines.push({"type": "sinusoidal", 'A': nxt[0], 'B': nxt[1], 'C': nxt[2], 'D': nxt[3], "string": `${nxt[0].toPrecision(4)}sin(${nxt[1].toPrecision(4)}x + ${nxt[2].toPrecision(4)}) + ${nxt[3].toPrecision(4)}`});
}
if(curtype == 'e'){
    lines.push({"type": "exponential", 'A': nxt[0], 'B': nxt[1], 'C': nxt[2], "string": `${nxt[0].toPrecision(4)}(${(Math.E**nxt[1]).toPrecision(4)}^x) + ${nxt[2].toPrecision(4)}`});
}
if(curtype == 'g'){
    lines.push({"type": "logarithmic", 'A': nxt[0], 'B': nxt[1], 'C': nxt[2], "string": `ln((x-${nxt[2].toPrecision(4)}) / ${nxt[0].toPrecision(4)}) / ${nxt[1].toPrecision(4)}`});
}

// Allow for saving, continue working, and saving again in 1 session
function refreshLastAttributes(){
    let title = document.getElementsByClassName('graph-title-input')[0].value;
    if(title == "") title = "Untitled Graph"
    document.getElementById('origName').value = title;
    document.getElementById('origPoints').value = document.getElementById("points").value;
    document.getElementsByClassName("save-status")[0].innerText = "✓";
}
// change the saved status to false
function setX(){
    document.getElementsByClassName("save-status")[0].innerText = "X";
}

// Unfinished undo/redo features
let stack = [], dump = [];
// stack and dump are both FIFO stacks
let p2i = [], l2i = [];
for(let _ = 0; _ < points.length; _++){
    p2i.push(points[_]);
}
for(let _ = 0; _ < lines.length; _++){
    l2i.push(lines[_]);
}
stack.push({l: l2i, p: p2i});

function undo(){
    /*
    1. pop the first element from stack, put it onto dump
    2. load the next element (last status of the graph)
    */
    document.getElementsByClassName("save-status")[0].innerText = "X";
    if(stack.length == 1) return;
    let obj = stack.pop();
    let pi = []; li = [];
    for(let _ = 0; _ < obj.p.length; _++){
        let pt = [];
        pt.push(obj.p[_][0]);
        pt.push(obj.p[_][1]);
        pi.push(pt);
    }
    for(let _ = 0; _ < obj.l.length; _++){
        let lt = [];
        lt.push(obj.l[_][0]);
        lt.push(obj.l[_][1]);
        li.push(lt);
    }
    dump.push({p: pi, l: li});
    for(let i = 0; i < stack.length; i++){
        console.log(stack[i].p.length);
    }
    lines = stack[stack.length-1].l;
    points = stack[stack.length-1].p;
}

function redo(){
    /*
    1. pop the first element from dump, load it
    2. put the element onto stack
    */
    document.getElementsByClassName("save-status")[0].innerText = "X";
    if(dump.length == 0) return;
    let obj = dump.pop();
    let pii = []; lii = [];
    for(let _ = 0; _ < obj.p.length; _++){
        let pt = [];
        pt.push(obj.p[_][0]);
        pt.push(obj.p[_][1]);
        pii.push(pt);
    }
    for(let _ = 0; _ < obj.l.length; _++){
        let lt = [];
        lt.push(obj.l[_][0]);
        lt.push(obj.l[_][1]);
        lii.push(lt);
    }
    let pi = []; li = [];
    for(let _ = 0; _ < obj.p.length; _++){
        let s = pii[_];
        pi.push(s);
    }
    for(let _ = 0; _ < obj.l.length; _++){
        li.push(lii[_]);
    }
    stack.push({p: pi, l: li});
    for(let i = 0; i < stack.length; i++){
        console.log(stack[i].p.length);
    }
    lines = li;
    points = pi;
}

// Get user defined shortcuts
let shortcuts = localStorage.getItem('shortcuts');
let sclist = shortcuts.split(" ");
document.getElementById("plot-key").innerText = "Plot ("+sclist[0]+")";
document.getElementById("delete-key").innerText = "Delete ("+sclist[1]+")";
document.getElementById("select-key").innerText = "Select ("+sclist[2]+")";

/** p5.js powered functions that enable the graphing functionality in the canvas **/

// p5.js setup function
function setup() {
    let w = document.getElementById("graph-display").offsetWidth-4.5;
    let h = document.getElementById("graph-display").offsetHeight-4.5;
    let canvas = createCanvas(w, h);
    canvas.mousePressed(onCanvasClick);
    canvas.parent("graph-display");

    background(245);
    textAlign(CENTER, CENTER);
}

// p5.js draw function - draws every frame
function draw() {
    background(245); // Grey

    // Adding the points and lines to local storage
    document.getElementById("user").value = localStorage.getItem("username");
    let pointStr = "";
    for (let i = 0; i < points.length; i++) {
        pointStr += "(";
        pointStr += points[i][0].toPrecision(4);
        pointStr += ",";
        pointStr += points[i][1].toPrecision(4);
        pointStr += "),";
    }

    let lineStr = "";
    for (let i = 0; i < lines.length; i++){
        if(lines[i].type == "linear"){
            lineStr += "l";
            lineStr += lines[i].m.toPrecision(4).toString();
            lineStr += "|";
            lineStr += lines[i].b.toPrecision(4).toString();
            lineStr += "|";
        }
        if(lines[i].type == "polynomial"){
            lineStr += 'p';
            for(let j = 0; j < lines[i].coeff.length; j++){
                lineStr += lines[i].coeff[j].toPrecision(4).toString();
                lineStr += "|";
            }
        }
        if(lines[i].type == "sinusoidal"){
            lineStr += 's';
            lineStr += lines[i].A.toPrecision(4).toString();
            lineStr += '|';
            lineStr += lines[i].B.toPrecision(4).toString();
            lineStr += '|';
            lineStr += lines[i].C.toPrecision(4).toString();
            lineStr += '|';
            lineStr += lines[i].D.toPrecision(4).toString();
            lineStr += "|";
        }
        if(lines[i].type == 'exponential'){
            lineStr += 'e';
            lineStr += lines[i].A.toPrecision(4).toString();
            lineStr += '|';
            lineStr += lines[i].B.toPrecision(4).toString();
            lineStr += '|';
            lineStr += lines[i].C.toPrecision(4).toString();
            lineStr += "|";
        }
        if(lines[i].type == 'logarithmic'){
            lineStr += 'g';
            lineStr += lines[i].A.toPrecision(4).toString();
            lineStr += '|';
            lineStr += lines[i].B.toPrecision(4).toString();
            lineStr += '|';
            lineStr += lines[i].C.toPrecision(4).toString();
            lineStr += "|";
        }
    }
    document.getElementById("points").value = pointStr;
    document.getElementById("lines").value = lineStr;
    /** END **/

    // Execute helper functions
    onWorkspaceKeyStatuses();
    drawCartesian();
    drawPointsAndLines();

    // Debugging disabled currently, could be used to make draw only execute once.
    debug = false;
}

// p5.js builtin function
function windowResized() {
    let w = document.getElementById("graph-display").offsetWidth-4.5;
    let h = document.getElementById("graph-display").offsetHeight-4.5;
    resizeCanvas(w, h);
    background(240);
}

// p5.js builtin function
function keyPressed() {
    if (!cursorInCanvas()) {
        return;
    }

    if (key === sclist[0]) {
        workspaceKeyStatuses["p"] = !workspaceKeyStatuses["p"];
    }

    if (key === sclist[1]) {
        workspaceKeyStatuses["d"] = true;
    }

    if (key === sclist[2]) {
        workspaceKeyStatuses["s"] = !workspaceKeyStatuses["s"];
        startDrag_X = mouseX;
        startDrag_Y = mouseY;
        endDrag_X = mouseX;
        endDrag_Y = mouseY;
    }

    // Debugging purposed only!
    /*if(key === "c") {
        lines = [];
        points = [];
    }*/
}

// p5.js builtin function
function onCanvasClick() {
    // Cursor must be in canvas
    if (!cursorInCanvas()) {
        return;
    }

    // To plot a point
    if (workspaceKeyStatuses["p"]) {
        let x = X_STEP * ((mouseX - y_axisPos) / x_stepPixels);
        x = parseFloat(x.toPrecision(4));
        let y = Y_STEP * (-(mouseY - x_axisPos) / y_stepPixels);
        y = parseFloat(y.toPrecision(4));

        appendToPointsTable_([x, y]);
        points.push([x, y]);

        /** For undo/redo stack **/
        pi = []; li = [];
        for(let _ = 0; _ < points.length; _++){
            pi.push(points[_]);
        }
        for(let _ = 0; _ < lines.length; _++){
            li.push(lines[_]);
        }
        stack.push({l: li, p: pi});
        dump = [];
        /** End **/

        document.getElementsByClassName("save-status")[0].innerText = "X";

    } 
    // To start the action of selecting over a region
    else if (workspaceKeyStatuses["s"]) {  
        startDrag_X = mouseX;
        startDrag_Y = mouseY;
        endDrag_X = mouseX;
        endDrag_Y = mouseY;
    } 
    // A left click with no "key statuses" being active means simply to select a point when pressed or deselect all selected points when pressed elsewhere.
    else {
        let pointClicked = false;

        for (let i = 0; i < points.length; i++) {
            let d =
                Math.sqrt(
                    (y_axisPos + points[i][0] * x_conversionFactor - mouseX) **
                        2 +
                        (x_axisPos -
                            points[i][1] * y_conversionFactor -
                            mouseY) **
                            2,
                ) - 3;
            if (d < 1) {
                if (selectedPoints.includes(points[i])) {
                    selectedPoints.splice(selectedPoints.indexOf(points[i]), 1);
                    pointClicked = true;
                } else {
                    selectedPoints.push(points[i]);
                    pointClicked = true;
                }
                break; //only want to select one point at a time
            }
        }
        if (!pointClicked) {
            //deselect all points if clicked on empty space
            selectedPoints = [];

            //in case if user wanted to drag the canvas
            startDrag_X = mouseX;
            startDrag_Y = mouseY;
            toDrag = true;
        }
        else {
            toDrag = false;
        }
    }
}

// p5.js builtin function
function mouseDragged() {
    if (!cursorInCanvas()) {
        return;
    }

    // Constantly updated end drag position when dragged
    if (workspaceKeyStatuses["s"]) {
        endDrag_X = mouseX;
        endDrag_Y = mouseY;
    }
    // Otherwise, treat a drag on the canvas as moving across the graph
    else{       
        let popupOpen = false;
        for (let popup of document.getElementsByClassName("popup")) {
            if (popup.style.display == "block"){
                popupOpen = true;
                break;
            }
        }

        if(toDrag && !keysInterfered() && !popupOpen){ 
            endDrag_X = mouseX;
            endDrag_Y = mouseY;
            delta_X_pixels = -(endDrag_X-startDrag_X);
            delta_Y_pixels = -(endDrag_Y-startDrag_Y);
            delta_X = delta_X_pixels / x_conversionFactor;
            delta_Y = -delta_Y_pixels / y_conversionFactor;
    
            X_RANGE = [X_RANGE[0] + delta_X, X_RANGE[1] + delta_X];
            Y_RANGE = [Y_RANGE[0] + delta_Y, Y_RANGE[1] + delta_Y];
    
            startDrag_X = endDrag_X;
            startDrag_Y = endDrag_Y;
        }
    }
}

// p5.js builtin function
function mouseReleased() {
    if (!cursorInCanvas()) {
        return;
    }

    // If "Select" is active, when mouse is released stop drawing the select region and select all points within
    if (workspaceKeyStatuses["s"]) {
        for (let i = 0; i < points.length; i++) {
            let x = y_axisPos + points[i][0] * x_conversionFactor;
            let y = x_axisPos - points[i][1] * y_conversionFactor;
            if (
                Math.min(startDrag_X, endDrag_X) < x &&
                x < Math.max(startDrag_X, endDrag_X) &&
                Math.min(startDrag_Y, endDrag_Y) < y &&
                y < Math.max(startDrag_Y, endDrag_Y) &&
                !selectedPoints.includes(points[i])
            ) {
                selectedPoints.push(points[i]);
            }
        }
        workspaceKeyStatuses["s"] = false;
        startDrag_X = 0;
        startDrag_Y = 0;
        endDrag_X = 0;
        endDrag_Y = 0;
    }
}

// p5.js builtin function
function mouseWheel(event) {
    if (!cursorInCanvas()){
        return;
    }

    // Allows the user to zoom in/out
    let zoomFactor = event.delta/1000;

    X_RANGE[0] = zoomFactor*[X_RANGE[0]-(mouseX-y_axisPos)/x_conversionFactor]+X_RANGE[0];
    X_RANGE[1] = zoomFactor*[X_RANGE[1]-(mouseX-y_axisPos)/x_conversionFactor]+X_RANGE[1];
    Y_RANGE[0] = zoomFactor*[Y_RANGE[0]-(x_axisPos-mouseY)/y_conversionFactor]+Y_RANGE[0];
    Y_RANGE[1] = zoomFactor*[Y_RANGE[1]-(x_axisPos-mouseY)/y_conversionFactor]+Y_RANGE[1];
}
/** END Builtin p5js functions **/

/** SELF-BUILT HELPER FUNCTIONS for p5js draw() **/

// Self-built helper function
function cursorInCanvas() {
    return mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0;
}

// Self-built helper function
function keysInterfered() { 
    // Check if keys are active simultaneously
    for (let key of Object.keys(workspaceKeyStatuses)) {
        if(workspaceKeyStatuses[key]) {
            return true;
        }
    }
    return false;
}

// Self-built helper function - draws the Cartesian plane every frame update
function drawCartesian() {
    // Axis lines
    x_substepPixels =
        (width - GRAPH_PADDING * 2) / ((X_RANGE[1] - X_RANGE[0]) / X_SUBSTEP);
    x_stepPixels =
        x_substepPixels * (X_STEP / X_SUBSTEP);
    y_axisPos = GRAPH_PADDING + x_substepPixels * (-X_RANGE[0] / X_SUBSTEP);
    y_substepPixels =
        (height - GRAPH_PADDING * 2) / ((Y_RANGE[1] - Y_RANGE[0]) / Y_SUBSTEP);
    y_stepPixels =
        y_substepPixels * (Y_STEP / Y_SUBSTEP);
    x_axisPos = GRAPH_PADDING + y_substepPixels * (Y_RANGE[1] / Y_SUBSTEP);

    // draw the axes
    strokeWeight(2);
    line(y_axisPos, 0, y_axisPos, height);
    line(0, x_axisPos, width, x_axisPos);

    // Tick-marks, tick labels, and grid lines
    // Start from the origin, draw ticks up
    let lastTick = y_axisPos-30;
    for (
        let x = y_axisPos;
        x <= width - GRAPH_PADDING;
        x += x_substepPixels
    ) {
        if(x-lastTick < 30) continue; // if this tick is within 30px of the last tick, ticks are too dense! Skip this tick
        lastTick = x;
        // Grid line
        stroke(128, 128, 128, 30);
        strokeWeight(1);
        line(x, 0, x, height);

        stroke("black");
        if (
            Math.abs(y_axisPos - x) % x_stepPixels < 0.1 ||
            x_stepPixels - Math.abs(y_axisPos - x) % x_stepPixels < 0.1
        ) {
            //main tick
            strokeWeight(2);
            line(x, x_axisPos - 5, x, x_axisPos + 5);
            if (Math.abs(x - y_axisPos) > 0.1) {
                strokeWeight(0.2);
                text(
                    Math.round(X_STEP * ((x - y_axisPos) / x_stepPixels)), // Changed
                    x,
                    x_axisPos - 15,
                );
            }
        } else {
            //subtick
            strokeWeight(1);
            line(x, x_axisPos - 2, x, x_axisPos + 2);
        }
    }
    lastTick = y_axisPos+30;
    for (
        let x = y_axisPos;
        x >= X_RANGE[0]+GRAPH_PADDING;
        x -= x_substepPixels
    ) {
        if(lastTick-x < 30) continue;
        lastTick = x;
        // Grid line
        stroke(128, 128, 128, 30);
        strokeWeight(1);
        line(x, 0, x, height);

        stroke("black");
        if (
            Math.abs(y_axisPos - x) % x_stepPixels < 0.1 ||
            x_stepPixels - Math.abs(y_axisPos - x) % x_stepPixels < 0.1
        ) {
            //main tick
            strokeWeight(2);
            line(x, x_axisPos - 5, x, x_axisPos + 5);
            if (Math.abs(x - y_axisPos) > 0.1) {
                strokeWeight(0.2);
                text(
                    Math.round(X_STEP * ((x - y_axisPos) / x_stepPixels)), // Changed
                    x,
                    x_axisPos - 15,
                );
            }
        } else {
            //subtick
            strokeWeight(1);
            line(x, x_axisPos - 2, x, x_axisPos + 2);
        }
    }
    lastTick = x_axisPos-30;
    for (
        let y = x_axisPos;
        y <= height - GRAPH_PADDING;
        y += y_substepPixels
    ) {
        /**
        if(debug){
            console.log(`${y-GRAPH_PADDING}, ${y_stepPixels}, ${Math.round((y-GRAPH_PADDING) % y_stepPixels) % y_stepPixels}`);
        }**/
        if(y-lastTick < 30) continue;
        lastTick = y;
        // Grid line
        stroke(128, 128, 128, 30);
        strokeWeight(1);
        line(0, y, width, y);

        stroke("black");
        if (
            Math.abs(x_axisPos - y) % y_stepPixels < 0.1 ||
            y_stepPixels - Math.abs(x_axisPos - y) % y_stepPixels < 0.1
        ) {
            //main tick
            strokeWeight(2);
            line(y_axisPos - 5, y, y_axisPos + 5, y);
            if (Math.abs(y - x_axisPos) > 0.1) {
                strokeWeight(0.2);
                text(
                    Math.round(Y_STEP * (-(y - x_axisPos) / y_stepPixels)), // Changed
                    y_axisPos - 20,
                    y,
                );
            }
        } else {
            //subtick
            strokeWeight(1);
            line(y_axisPos - 2, y, y_axisPos + 2, y);
        }
    }
    lastTick = x_axisPos+30;
    for (
        let y = x_axisPos;
        y >= Y_RANGE[0]+GRAPH_PADDING;
        y -= y_substepPixels
    ) {
        /**
        if(debug){
            console.log(`${y-GRAPH_PADDING}, ${y_stepPixels}, ${Math.round((y-GRAPH_PADDING) % y_stepPixels) % y_stepPixels}`);
        }**/
        if(lastTick-y < 30) continue;
        lastTick = y;
        // Grid line
        stroke(128, 128, 128, 30);
        strokeWeight(1);
        line(0, y, width, y);

        stroke("black");
        if (
            Math.abs(x_axisPos - y) % y_stepPixels < 0.1 ||
            y_stepPixels - Math.abs(x_axisPos - y) % y_stepPixels < 0.1
        ) {
            //main tick
            strokeWeight(2);
            line(y_axisPos - 5, y, y_axisPos + 5, y);
            if (Math.abs(y - x_axisPos) > 0.1) {
                strokeWeight(0.2);
                text(
                    Math.round(Y_STEP * (-(y - x_axisPos) / y_stepPixels)), // Changed
                    y_axisPos - 20,
                    y,
                );
            }
        } else {
            //subtick
            strokeWeight(1);
            line(y_axisPos - 2, y, y_axisPos + 2, y);
        }
    }
}

// Self-built helper function - draws the points and lines every frame update
function drawPointsAndLines() {
    x_conversionFactor = x_stepPixels / X_STEP;
    y_conversionFactor = y_stepPixels / Y_STEP;
    
    // Points
    for (let point of points) {
        if (selectedPoints.includes(point)) {
            stroke("red");
            fill("red");
            circle(
                y_axisPos + point[0] * x_conversionFactor,
                x_axisPos - point[1] * y_conversionFactor,
                10,
            );
        }
        stroke("black");
        fill("black");
        circle(
            y_axisPos + point[0] * x_conversionFactor,
            x_axisPos - point[1] * y_conversionFactor,
            6,
        );
    }
    stroke("black");
    fill("black");

    // Lines
    for (let i = 0; i < lines.length; i++) {
        strokeWeight(2);
        if(lines[i].string.includes("NaN") && !lines[i].invalid){
            alert("Cannot draw regression! For logarithmics and exponential, please only have points over 1 side of the x-axis and y-axis respectively!");
            lines[i].invalid = true;
        }
        else if(!lines[i].invalid){
            if(lines[i].type == "sinusoidal"){
                sketchFunction(lines[i], lines[i].type, 1);
            }
            else{
                sketchFunction(lines[i], lines[i].type, 2);
            }
        }
    }
}

// Self-built helper function - do something when each workspace key is active
function onWorkspaceKeyStatuses() {
    // Plot
    if (workspaceKeyStatuses["p"]) {
        // Main code for when a point is plotted is in onCanvasClick
        cursor(CROSS);
    } else {
        cursor(ARROW);
    }
    // Delete
    if (workspaceKeyStatuses["d"]) {
        for (let i = 0; i < selectedPoints.length; i++) {
            deleteFromPointsTable_(selectedPoints[i]);
            points.splice(points.indexOf(selectedPoints[i]), 1);
        }

        /** Code for undo/redo stack **/
        let pi = []; li = [];
        for(let _ = 0; _ < points.length; _++){
            pi.push(points[_]);
        }
        for(let _ = 0; _ < lines.length; _++){
            li.push(lines[_]);
        }
        stack.push({l: li, p: pi});
        dump = [];

        document.getElementsByClassName("save-status")[0].innerText = "X";
        /** END stack**/
        
        selectedPoints = [];
        workspaceKeyStatuses["d"] = false;
    }
    // Select
    if (workspaceKeyStatuses["s"]) {
        strokeWeight(1);
        stroke("black");
        fill("rgba(220, 220, 220, .2)");
        drawingContext.save();
        drawingContext.setLineDash([5, 5]);
        rect(
            startDrag_X,
            startDrag_Y,
            endDrag_X - startDrag_X,
            endDrag_Y - startDrag_Y,
        ); // Constantly update select region when dragging
        drawingContext.restore();
    }
}

// Self-built helper function - Goes home when the logo is pressed
function goHome() {
    localStorage.removeItem("graph-name");
    localStorage.removeItem("points");
    window.location.href = "home";
}

// Self-built helper function - helper function for drawPointsAndLines()
function sketchFunction(line__, type, detailNumber) {
    if(line__.string.includes("NaN")){
        alert("Cannot draw regression! For logarithmics and exponential, please only have points over 1 side of the x-axis and y-axis respectively!");
        return;
    }
    // Simply draw a line if it is a linear function
    if(type == "linear"){
        let x_left = X_STEP * ((0 - y_axisPos) / x_stepPixels);
        let y_left = line__.m * x_left + line__.b;
        let x_right = X_STEP * ((width - y_axisPos) / x_stepPixels);
        let y_right = line__.m * x_right + line__.b;

        line(
            0,
            x_axisPos - y_left * y_conversionFactor,
            width,
            x_axisPos - y_right * y_conversionFactor,
        );

        strokeWeight(0.5);
        textAlign(LEFT);
        text(line__.string, 10, x_axisPos - y_left * y_conversionFactor + 10);
        strokeWeight(2);
        textAlign(CENTER);

        return;
    }
    if(type == "logarithmic"){ //Gets very laggy if the graph is near linear
        var VA_pos = line__.C * x_conversionFactor + y_axisPos;

        let x_left = X_STEP * ((VA_pos - y_axisPos) / x_stepPixels);
        let x_right = X_STEP * ((VA_pos + detailNumber - y_axisPos) / x_stepPixels);
        let y_left;
        if(line__.B > 0) y_left = Y_RANGE[0]-100;
        else y_left = Y_RANGE[1]+100;
        let y_right = Math.log((x_right-line__.C)/line__.A)/line__.B;

        // First line after vertical asymptote
        line(
            VA_pos,
            x_axisPos - y_left * y_conversionFactor,
            VA_pos+detailNumber,
            x_axisPos - y_right * y_conversionFactor,
        );
        
        // Equation label
        strokeWeight(0.5);
        textAlign(LEFT);
        text(line__.string, VA_pos + 10, x_axisPos - y_right * y_conversionFactor + 10);
        strokeWeight(2);
        textAlign(CENTER);
        
        for(let x = VA_pos+detailNumber; x <= width+detailNumber; x += detailNumber){
            x_left = X_STEP * ((x - y_axisPos) / x_stepPixels);
            x_right = X_STEP * ((x+detailNumber - y_axisPos) / x_stepPixels);
            y_left = Math.log((x_left-line__.C)/line__.A)/line__.B;
            y_right = Math.log((x_right-line__.C)/line__.A)/line__.B;

            line(
                x,
                x_axisPos - y_left * y_conversionFactor,
                x+detailNumber,
                x_axisPos - y_right * y_conversionFactor,
            );
        }

        return;
    }

    // Otherwise draw a lot of small lines continuously to simulate a curved function
    else{
        for(let x = 0; x <= width+detailNumber; x += detailNumber){ 
            let x_left = X_STEP * ((x - y_axisPos) / x_stepPixels);
            let x_right = X_STEP * ((x+detailNumber - y_axisPos) / x_stepPixels);
            
            let y_left = 0;
            let y_right = 0;
    
            if(type == "polynomial"){
                for(let j = 0; j < line__.coeff.length; j++){
                    y_left += line__.coeff[j]*(x_left**j);
                    y_right += line__.coeff[j]*(x_right**j);
                }
            }
            else if(type == "sinusoidal"){
                y_left = line__.A*Math.sin(line__.B*x_left+line__.C)+line__.D;
                y_right = line__.A*Math.sin(line__.B*x_right+line__.C)+line__.D;
            }
            else if(type == "exponential"){
                y_left = line__.A*(Math.E**(line__.B*x_left))+line__.C;
                y_right = line__.A*(Math.E**(line__.B*x_right))+line__.C;
            }

            line(
                x,
                x_axisPos - y_left * y_conversionFactor,
                x+detailNumber,
                x_axisPos - y_right * y_conversionFactor,
            );
            if(x === 0){
                strokeWeight(0.5);
                textAlign(LEFT);
                text(line__.string, 10, x_axisPos - y_left * y_conversionFactor + 10);
                strokeWeight(2);
                textAlign(CENTER);
            }
        }
    }
}
