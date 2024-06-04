//TODO: Add undo and redo feature here

window.sidebarHandler = function sidebarHandler() {
    pointsSidebarHandler();
    regressionsSidebarHandler();
    /*onGraphElementChanges();*/
};

const parser = new DOMParser();

var tableValues, tableRows;
var filterParams = [];
const selectedClr = "rgb(215, 233, 151)";
const editClr = "rgb(175, 192, 115)";
const errorClr = "rgb(247, 118, 101)";

function pointsSidebarHandler() {
    tableValues = document.getElementById("points-table-values");
    tableRows = tableValues.getElementsByTagName("tr");

    // Initialize points
    if(points.length > 0){
        for(let i = 0; i < points.length; i++){
            appendToPointsTable(points[i]);
        }
    }

    // Add entry
    document.getElementById("points-add-btn").addEventListener("click", function() {
        appendToPointsTable();
        document.getElementsByClassName("side-bar-table-container")[0].scrollTop = document.getElementsByClassName("side-bar-table-container")[0].scrollHeight;
        points.push([NaN, NaN]);
    });  

    // Remove entry
    document.getElementById("points-remove-btn").addEventListener("click", function() {
        console.log(tableRows[0]);
        for(let i = 1; i < tableRows.length; i++){
            let r = tableRows[i].getElementsByTagName("th");
            for(let j = 0; j < 2; j++){
                if(r[j].style.backgroundColor == selectedClr){
                    tableRows[i].remove();
                    points.splice(i-1, 1);
                    i--;
                    break;
                }
            }
        }
    });

    // Edit entry
    document.getElementById("points-edit-btn").addEventListener("click", function() {
        for(let i = 1; i < tableRows.length; i++){
            let r = tableRows[i].getElementsByTagName("th");
            for(let j = 0; j < 2; j++){
                if(r[j].style.backgroundColor == selectedClr){
                    r[j].style.backgroundColor = editClr;
                    r[j].setAttribute("contentEditable", true);

                    r[j].focus();
                    let range = document.createRange();
                    let selection = window.getSelection();
                    range.setStart(r[j], 1);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    return;
                }
            }
        }
    });

    uploadBtnHandler();
    function uploadBtnHandler(){
        let uploadPopup = document.getElementsByClassName("pts-upload-popup")[0];
        let uploadBtn = document.getElementById("points-upload-btn");
        let uploadExitBtn = uploadPopup.getElementsByClassName("exit-btn")[0];
        let uploadEnterBtn = uploadPopup.getElementsByClassName("enter-btn")[0];

        uploadBtn.addEventListener("click", function() {
            let rect = uploadBtn.getBoundingClientRect();
            uploadPopup.style = `
                display: block;
                position: fixed;
                top: ${rect.bottom}px;
                left: ${rect.left}px;
            `;
        });

        uploadExitBtn.addEventListener("click", function() {
            uploadPopup.style.display = "none";
        });

        uploadEnterBtn.addEventListener("click", function() {
            let csvText = uploadPopup.getElementsByTagName("textarea")[0].value;

            if(!csvText){
                alert("Empty input! Try again");
                return;
            }
            for(let row of csvText.split("\n")){
                let pt = row.split(",");
                let x = parseFloat(pt[0]);
                let y = parseFloat(pt[1]);

                if((!x && x != 0) || (!y && y != 0)) {
                    alert("Invalid input! Try again");
                    return;
                }
            }

            for(let row of csvText.split("\n")){
                let pt = row.split(",");
                let x = parseFloat(pt[0]);
                let y = parseFloat(pt[1]);
                appendToPointsTable([x, y]);
                points.push([x, y]);
            }
        });
    }

    filterBtnHandler();
    function filterBtnHandler(){
        let filterPopup = document.getElementsByClassName("pts-filter-popup")[0];
        let filterBtn = document.getElementById("points-filter-btn");
        let filterExitBtn = filterPopup.getElementsByClassName("exit-btn")[0];
        let filterEnterBtn = filterPopup.getElementsByClassName("enter-btn")[0];

        filterBtn.addEventListener("click", function() {
            let rect = filterBtn.getBoundingClientRect();
            //console.log(rect.right);
            filterPopup.style = `
                display: block;
                position: fixed;
                top: ${rect.bottom}px;
                right: ${window.innerWidth-rect.right}px;
            `;
        });

        filterExitBtn.addEventListener("click", function() {
            filterPopup.style.display = "none";
        });

        filterEnterBtn.addEventListener("click", function() {
            filterParams = [document.getElementById("x-left-bound").value, document.getElementById("x-right-bound").value, document.getElementById("y-left-bound").value,  document.getElementById("y-right-bound").value];
            for(let num of filterParams){
                if(!parseFloat(num) && num != 0 && num != ""){
                    filterParams = [];
                    alert("Invalid filter parameters!");
                    return;
                }
            }
            for(let i = 0; i < filterParams.length; i++){
                if(filterParams[i] === ""){
                    if(i % 2 == 0){
                        filterParams[i] = -Infinity;
                    }
                    else{
                        filterParams[i] = Infinity;
                    }
                }
                else{
                    filterParams[i] = parseFloat(filterParams[i]);
                }
            }

            unfilter();
            filter();
            tableFilterBtn.getElementsByTagName("img")[0].setAttribute("alt", "Table filtered");
            tableFilterBtn.getElementsByTagName("img")[0].setAttribute("src", "Images/workspace-sidebar/filter-black.png");
            filterPopup.style.display = "none";
        });
    }

    let tableFilterBtn = document.getElementById("side-bar-table-filter-btn");
    document.getElementById("side-bar-table-filter-btn").addEventListener("click", function(){
        /*
        console.log(filterParams);
        filterParams[0][0] = 0;
        if(filterParams[0][0] === "")alert("YESSS")*/
        if(tableFilterBtn.getElementsByTagName("img")[0].getAttribute("alt") == "Table unfiltered"){
            filter();
            tableFilterBtn.getElementsByTagName("img")[0].setAttribute("alt", "Table filtered");
            tableFilterBtn.getElementsByTagName("img")[0].setAttribute("src", "Images/workspace-sidebar/filter-black.png");
        }
        else{
            unfilter();
            tableFilterBtn.getElementsByTagName("img")[0].setAttribute("alt", "Table unfiltered");
            tableFilterBtn.getElementsByTagName("img")[0].setAttribute("src", "Images/workspace-sidebar/filter-white.png");
        }
    });

    function filter(){
        for(let i = 1; i < tableRows.length; i++){
            let r = tableRows[i].getElementsByTagName("th");
            let x = parseFloat(r[0].innerText);
            let y = parseFloat(r[1].innerText);
            
            if(x < filterParams[0] || x > filterParams[1] || y < filterParams[2] || y > filterParams[3]){
                tableRows[i].style.display = "none";
            }
        }
    }
    function unfilter(){
        for(let i = 0; i < tableRows.length; i++){
            tableRows[i].style.display = "table-row";
        }
    }
}

var tableValues2, tableRows2;
function regressionsSidebarHandler() {
    tableValues2 = document.getElementById("regressions-table-values");
    tableRows2 = tableValues2.getElementsByTagName("tr");

    // Initialize functions
    if(lines.length > 0){
        for(let i = 0; i < lines.length; i++){
            appendToRegressionsTable(lines[i]);
        }
    }

    // Remove entry
    document.getElementById("regressions-remove-btn").addEventListener("click", function() {
        for(let i = 1; i < tableRows2.length; i++){
            let r = tableRows2[i].getElementsByTagName("th");
            for(let j = 0; j < 2; j++){
                if(r[j].style.backgroundColor == selectedClr){
                    tableRows2[i].remove();
                    lines.splice(i-1, 1);
                    i--;
                    break;
                }
            }
        }
    });
}

// Helper functions
function onPointCellClick(cell) {
    cell.addEventListener("click", function() {
        if(cell.contentEditable == "inherit" || cell.contentEditable == "false"){
            if (cell.style.backgroundColor == selectedClr){
                cell.style.backgroundColor = tableValues.style.backgroundColor;
            }
            else{
                cell.style.backgroundColor = selectedClr;
            }
        }
    });

    cell.addEventListener("keydown", (event) => {
        if(event.keyCode === 13){
            cell.setAttribute("contentEditable", false);
            cell.style.backgroundColor = tableValues.style.backgroundColor;

            for(let i = 1; i < tableRows.length; i++){
                let r = tableRows[i].getElementsByTagName("th");
                for(let j = 0; j < 2; j++){
                    if(r[j].isSameNode(cell)){
                        points[i-1][j] = parseFloat(r[j].innerText);
                        //console.log(points[i-1][j])
                        if(!points[i-1][j] && points[i-1][j] != 0){
                            cell.style.color = errorClr;
                        }
                        else{
                            cell.style.color = "black";
                        }
                        return;
                    }
                }
            }
        }
    });

    cell.addEventListener("blur", (event) => {
        cell.setAttribute("contentEditable", false);
        cell.style.backgroundColor = tableValues.style.backgroundColor;

        for(let i = 1; i < tableRows.length; i++){
            let r = tableRows[i].getElementsByTagName("th");
            for(let j = 0; j < 2; j++){
                if(r[j].isSameNode(cell)){
                    points[i-1][j] = parseFloat(r[j].innerText);
                    //console.log(points[i-1][j])
                    if(!points[i-1][j] && points[i-1][j] != 0){
                        cell.style.color = errorClr;
                    }
                    else{
                        cell.style.color = "black";
                    }
                    return;
                }
            }
        }
    });
}

function appendToPointsTable(pt=false){
    let row = document.createElement("tr");
    let c1 = document.createElement("th");
    //console.log(pt);
    if(!pt[0] && pt[0] != 0){
        c1.style.color = errorClr;
        c1.innerText = "!";
    }
    else{
        c1.innerText = pt[0];
    }
    let c2 = document.createElement("th");
    if(!pt[1] && pt[1] != 0){
        c2.style.color = errorClr;
        c2.innerText = "!";
    }
    else{
        c2.innerText = pt[1];
    }

    row.appendChild(c1);
    row.appendChild(c2);
    tableValues.appendChild(row);

    onPointCellClick(c1);
    onPointCellClick(c2);
}
window.appendToPointsTable_ = function appendToPointsTable_(pt){
    appendToPointsTable(pt);
}

function deleteFromPointsTable(pt){
    let i = points.indexOf(pt);
    if(i >= 0){
        tableRows[i+1].remove();
    }
    else{
        return;
    }
}
window.deleteFromPointsTable_ = function deleteFromPointsTable_(pt){
    deleteFromPointsTable(pt);
}

function onRegressionCellClick(cell) {
    cell.addEventListener("click", function() {
        if(cell.contentEditable == "inherit" || cell.contentEditable == "false"){
            if (cell.style.backgroundColor == selectedClr){
                cell.style.backgroundColor = tableValues.style.backgroundColor;
            }
            else{
                cell.style.backgroundColor = selectedClr;
            }
        }
    });
}

function appendToRegressionsTable(regression){
    let row = document.createElement("tr");
    let c1 = document.createElement("th");
    c1.innerText = regression.type;
    let c2 = document.createElement("th");
    c2.innerText = regression.string;

    row.appendChild(c1);
    row.appendChild(c2);
    tableValues2.appendChild(row);

    onRegressionCellClick(c1);
    onRegressionCellClick(c2);
}
window.appendToRegressionsTable_ = function appendToRegressionsTable_(regression){
    appendToRegressionsTable(regression);
}