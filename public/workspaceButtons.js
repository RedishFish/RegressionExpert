window.onload = function(){
    document.getElementById('plot-btn').onclick = function() {
        clearKeyStatuses();
        workspaceKeyStatuses['p'] = !workspaceKeyStatuses['p'];
    };
    document.getElementById('delete-btn').onclick = function() {
        clearKeyStatuses();
        workspaceKeyStatuses['d'] = true;
    };
    document.getElementById('new-regression-btn').onclick = function() {
        clearKeyStatuses();
        workspaceKeyStatuses['n'] = true;
    };
}

function clearKeyStatuses() {
    for(let key in workspaceKeyStatuses) {
        workspaceKeyStatuses[key] = false;
    }
}
