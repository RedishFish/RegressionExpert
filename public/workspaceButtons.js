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
}