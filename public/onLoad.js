/*
*    Author: Philip Xu
*    Date: 2024/06/18
*    Description: Executed upon the website loading.
*/

var pyodideReadyPromise, pyodide;

window.onload = async function() {
    // Load pyodide and Python libraries
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

    // Import Python libraries
    pyodide.runPython(`
        import math
        import numpy as np
        from scipy.optimize import leastsq
    `);

    document.getElementsByClassName("load-screen")[0].classList.add("loaded"); // Hide load screen

    // Execute the module files mainWorkspaceHandler.js, workspaceButtons.js, and sidebarHandler.js
    mainWorkspaceHandler();
    workspaceButtons();
    sidebarHandler();
}