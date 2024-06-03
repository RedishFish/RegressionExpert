// TODO: Also put all python stuff in async function?
var pyodideReadyPromise, pyodide;

window.onload = async function() {
    
    pyodideReadyPromise = await loadPyodide();
    pyodide = await pyodideReadyPromise;
    await pyodide.loadPackage("numpy");
    await pyodide.loadPackage("scipy");

    /* For testing NaN behavior in python
    pyodide.globals.set("test", NaN);
    pyodide.runPython(`
        print(test)
        print(type(test))
        test = 1
    `);
    pyodide.runPython(`
        print(test)
        print(type(test))
    `);*/
    
    pyodide.runPython(`
        import math
        import numpy as np
        from scipy.optimize import leastsq
    `);

    document.getElementsByClassName("load-screen")[0].classList.add("loaded");
    
    mainWorkspaceHandler();
    workspaceButtons();
    sidebarHandler();
}