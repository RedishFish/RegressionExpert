let x_scalePopup, x_scaleBtn, x_enterBtn, x_exitBtn;

window.onload = function() {
    x_scalePopup = document.getElementsByClassName("x-scale-popup")[0];
    x_scaleBtn = document.getElementById("x-scale-btn");
    x_exitBtn = x_scalePopup.getElementsByClassName("exit-btn")[0];
    x_enterBtn = x_scalePopup.getElementsByClassName("x-scale-popup")[0].getElementsByClassName("enter-btn")[0];
}

x_scaleBtn.onclick = function() {
    x_scalePopup.style.display = "block";
}

x_exitBtn.onclick = function() {
    x_scalePopup.style.display = "none";
}

x_enterBtn.onclick = function() {
    ;
}

