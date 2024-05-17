window.popupHandler = function popupHandler() {
    x_scaleBtnHandler();
    y_scaleBtnHandler();
    regressionBtnHandler();
};

function x_scaleBtnHandler() {
    let x_scalePopup = document.getElementsByClassName("x-scale-popup")[0];
    let x_scaleBtn = document.getElementById("x-scale-btn");
    let x_exitBtn = x_scalePopup.getElementsByClassName("exit-btn")[0];
    let x_enterBtn = x_scalePopup.getElementsByClassName("enter-btn")[0];

    x_scaleBtn.addEventListener("click", function() {
        let rect = x_scaleBtn.getBoundingClientRect();
        x_scalePopup.style = `
            display: block;
            position: fixed;
            top: ${rect.bottom}px;
            left: ${rect.left}px;
        `;
    });

    x_exitBtn.addEventListener("click", function() {
        x_scalePopup.style.display = "none";
    });

    x_enterBtn.addEventListener("click", function() {
        let step = parseInt(document.getElementById("x-increment-field").value);
        let substep = parseInt(document.getElementById("x-subincrement-field").value);
        let leftLimit = parseInt(document.getElementById("x-left-limit-field").value);
        let rightLimit = parseInt(document.getElementById("x-right-limit-field").value);
        let x_axisBreak = parseInt(document.getElementById("x-axis-break-field").value);

        if(leftLimit && rightLimit) X_RANGE = [leftLimit, rightLimit];
        if(step) X_STEP = step;
        if(substep) X_SUBSTEP = substep;
    });
}

function y_scaleBtnHandler() {
    let y_scalePopup = document.getElementsByClassName("y-scale-popup")[0];
    let y_scaleBtn = document.getElementById("y-scale-btn");
    let y_exitBtn = y_scalePopup.getElementsByClassName("exit-btn")[0];
    let y_enterBtn = y_scalePopup.getElementsByClassName("enter-btn")[0];

    y_scaleBtn.addEventListener("click", function() {
        let rect = y_scaleBtn.getBoundingClientRect();
        y_scalePopup.style = `
            display: block;
            position: fixed;
            top: ${rect.bottom}px;
            left: ${rect.left}px;
        `;
    });

    y_exitBtn.addEventListener("click", function() {
        y_scalePopup.style.display = "none";
    });

    y_enterBtn.addEventListener("click", function() {
        let step = parseInt(document.getElementById("y-increment-field").value);
        let substep = parseInt(document.getElementById("y-subincrement-field").value);
        let leftLimit = parseInt(document.getElementById("y-left-limit-field").value);
        let rightLimit = parseInt(document.getElementById("y-right-limit-field").value);
        let y_axisBreak = parseInt(document.getElementById("y-axis-break-field").value);

        if(leftLimit && rightLimit) Y_RANGE = [leftLimit, rightLimit];
        if(step) Y_STEP = step;
        if(substep) Y_SUBSTEP = substep;
    });
}

function regressionBtnHandler() {
    let regressionPopup = document.getElementsByClassName("regression-popup")[0];
    let regressionBtn = document.getElementById("new-regression-btn");
    let regressionExitBtn = regressionPopup.getElementsByClassName("exit-btn")[0];
    let regressionEnterBtn = regressionPopup.getElementsByClassName("enter-btn")[0];

    regressionBtn.addEventListener("click", function() {
        let rect = regressionBtn.getBoundingClientRect();
        regressionPopup.style = `
            display: block;
            position: fixed;
            top: ${rect.bottom}px;
            left: ${rect.left}px;
        `;
    });

    regressionExitBtn.addEventListener("click", function() {
        regressionPopup.style.display = "none";
    });

    regressionEnterBtn.addEventListner("click", function() {
        ;
    });
}