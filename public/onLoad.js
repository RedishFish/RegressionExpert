//import { popupHandler } from "./popupHandler.js";
//import { workspaceButtons } from "./workspaceButtons.js";
//const require = createRequire(import.meta.url);
//const popupHandler = require('popupHandler');
//const workspaceButtons = require('workspaceButtons');

var pyodideReadyPromise, pyodide;
window.onload = async function() {
    pyodideReadyPromise = await loadPyodide();
    pyodide = await pyodideReadyPromise;
    await pyodide.loadPackage("numpy");
    await pyodide.loadPackage("scipy");

    popupHandler();
    workspaceButtons();
}