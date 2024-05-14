window.onload = function(){
    document.getElementById('plot-btn').onclick = function() {
        workspaceKeyStatuses['p'] = !workspaceKeyStatuses['p'];
    };
    document.getElementById('delete-btn').onclick = function() {
        workspaceKeyStatuses['d'] = true;
    };
    document.getElementById('select-btn').onclick = function() {
        workspaceKeyStatuses['s'] = !workspaceKeyStatuses['s'];
    };
    document.getElementById('new-regression-btn').onclick = function() {
        workspaceKeyStatuses['n'] = true;
    };
}

