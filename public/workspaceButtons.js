window.workspaceButtons = function workspaceButtons() {
    document.getElementById('plot-btn').onclick = function() {
        workspaceKeyStatuses['p'] = !workspaceKeyStatuses['p'];
    };
    document.getElementById('delete-btn').onclick = function() {
        workspaceKeyStatuses['d'] = true;
    };
    document.getElementById('select-btn').onclick = function() {
        workspaceKeyStatuses['s'] = !workspaceKeyStatuses['s'];
    };
    document.getElementById('x-scale-btn').onclick = function() {
        workspaceKeyStatuses['x'] = true;
    };
    document.getElementById('y-scale-btn').onclick = function() {
        workspaceKeyStatuses['y'] = true;
    };
    document.getElementById('new-regression-btn').onclick = function() {
        workspaceKeyStatuses['n'] = true;
    };
}