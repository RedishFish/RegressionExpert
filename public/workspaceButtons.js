/*
 *    Author: Philip Xu
 *    Date: 2024/06/18
 *    Description: Changes the key states for main workspace keys affecting the canvas.
 */

window.workspaceButtons = function workspaceButtons() {
    document.getElementById("plot-btn").onclick = function () {
        workspaceKeyStatuses["p"] = !workspaceKeyStatuses["p"];
    };
    document.getElementById("delete-btn").onclick = function () {
        workspaceKeyStatuses["d"] = true;
    };
    document.getElementById("select-btn").onclick = function () {
        workspaceKeyStatuses["s"] = !workspaceKeyStatuses["s"];
    };
};
