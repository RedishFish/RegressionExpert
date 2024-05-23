//TODO: Allow different degree for polynomial
//BUG:Sin issue and logarithmic not working for negative x-vals

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

    regressionEnterBtn.addEventListener("click", function() {
        let regressionType = document.getElementById("regression-type-selector").value;

        async function addPython() {
            try {
                pyodide.globals.set("points", points);
                if(regressionType == "linear"){
                    pyodide.runPython(`
                        for i in points:
                            cp = 0
                            sx = 0
                            sx2 = 0
                            sy = 0
                            res = 0
                            tot = 0
                            for i in range(len(points)):
                                cp += points[i][0]*points[i][1]
                                sx += points[i][0]
                                sx2 += points[i][0]*points[i][0]
                                sy += points[i][1]
                            
                            m = (len(points)*cp-sx*sy)/(len(points)*sx2-sx*sx)
                            b = (sy/len(points))-m*(sx/len(points))
                            for i in range(len(points)):
                                res += (m*points[i][0]+b-points[i][1])**2
                                tot += (points[i][1]-sy/len(points))**2
                            r2 = 1-res/tot
                    `);
                    let m = pyodide.globals.toJs().get('m');
                    let b = pyodide.globals.toJs().get('b');
                    lines.push({"type": "linear", "m": m, "b": b, "string": `y = ${m.toFixed(2)}x + ${b.toFixed(2)}`});
                    return;
                }
                if(regressionType == "polynomial"){ 
                    pyodide.globals.set("ord", 3);

                    pyodide.runPython(`
                        mat = [] # the matrix
                        col = [] # the column vector part of the matrix equation
                        sums = []
                        for i in range(2*ord+1):
                            sum = 0
                            for j in range(len(points)):
                                sum += points[j][0]**i
                            sums.append(sum)
                        
                        for i in range(ord+1):
                            row = []
                            for j in range(ord+1):
                                row.append(sums[i+j])
                            mat.append(row)
                        for i in range(ord+1):
                            sum = 0
                            for j in range(len(points)):
                                sum += points[j][1]*(points[j][0]**i)
                            col.append(sum)
                        # now the initialization of the matrix equation is complete. 
                        # now solve the equation using Gaussian Elimination
                        for i in range(ord+1):
                            # Gaussian elimination: for the i-th row, eliminate the i-th 
                            # term (reduce to 0) of every row under it. Modify the other 
                            # terms accordingly 
                            for j in range(i+1, ord+1):
                                div = mat[j][i]/mat[i][i]
                                for k in range(ord+1):
                                    mat[j][k] -= div*mat[i][k]
                                col[j] -= div*col[i]
                        # now the matrix is in row echelon form
                        # now solve using back substitution
                        for i in range(ord, -1, -1):
                            for j in range(i-1, -1, -1):
                                div = mat[j][i]/mat[i][i]
                                mat[j][i] = 0
                                col[j] -= div*col[i]
                        coeff = [] # this is the list of coefficients of the polynomial, listed from the 0th-term (constant) to the largest degreed term
                        for i in range(ord+1):
                            coeff.append(col[i]/mat[i][i])
                    `);
                    let coeff = pyodide.globals.toJs().get("coeff");
                    
                    let res = `${coeff[0].toFixed(2)}`;
                    for(let i = 1; i < coeff.length; i++){
                        res = `${coeff[i].toFixed(2)}x^${i} + ${res}`
                    }

                    lines.push({"type": "polynomial", "coeff": coeff, "string": res});
                    return;
                }
                if(regressionType == "sinusoidal"){
                    pyodide.runPython(`
                        # complete, but is not guaranteed to give correct answer every time
                        import numpy as np
                        from scipy.optimize import leastsq
                        
                        N = 100 # number of data points
                        X = np.linspace(0, 4*np.pi, N) 
                        Y = 3.0*np.sin(1.3*X+0.001) + 0.5
                        
                        def getSinReg(x, y):
                            # form: asin(bx+c)+d
                            ans = [0, 0, 0, 0, 999999999]
                            for _ in range(100):
                                # these 4 values are initial guesses
                                # because there is no good way to guess b, we brute force all possibilities < 20
                                a = np.sqrt(np.mean(x)**2-np.std(x)**2)
                                b = 0.2+_*0.2
                                c = 0
                                d = np.mean(x)
                                
                                func = lambda arr: arr[0]*np.sin(arr[1]*x+arr[2]) + arr[3] - y
                                res = leastsq(func, [a, b, c, d])[0]
                                cur = 0
                                for i in range(x.size):
                                    cur += (a*np.sin(b*x[i]+c)+d-y[i])**2
                                cur += _*100
                                if(cur < ans[4]):
                                    ans = [res[0], res[1], res[2], res[3], cur]
                            return [ans[0], ans[1], ans[2], ans[3]]
                        
                        X = np.array([p[0] for p in points])
                        Y = np.array([p[1] for p in points])
                        ans = getSinReg(X, Y)
                    `);
                    let ans = pyodide.globals.toJs().get("ans");
                    lines.push({"type": "sinusoidal", 'A': ans[0], 'B': ans[1], 'C': ans[2], 'D': ans[3], "string": `${ans[0].toFixed(2)}sin(${ans[1].toFixed(2)}x + ${ans[2].toFixed(2)}) + ${ans[3].toFixed(2)}`});
                    
                    return;
                }
                if(regressionType == "exponential"){
                    pyodide.runPython(`
                        # complete
                        # logarithmic regression is the same as exponential regression
                        # you pass in the parameters (Y, X) instead of (X, Y), and 
                        # then your regression is ln((x-c)/a)/b.
                        import numpy as np
                        from scipy.optimize import leastsq
                    
                        def getLinReg(x, y): 
                            # formula from Mr. Li's MDM4U workbook.
                            cp = 0 
                            sx = 0
                            sx2 = 0
                            sy = 0
                            for i in range(len(x)):
                                cp += x[i]*y[i]
                                sx += x[i]
                                sx2 += x[i]*x[i]
                                sy += y[i]
                    
                            a = (len(x)*cp-sx*sy)/(len(x)*sx2-sx*sx)
                            b = (sy/len(x))-a*(sx/len(x))
                            return [a, b]
                        
                        X = np.linspace(1.0, 8.0, 8)
                        Y = np.array([6, 11.4, 24.6, 54, 87, 204, 381, 786])
                        def getExpReg(x, y):
                            # x and y are list of x and y values
                            # form: a*e^(bx)+c
                            # it can be proven that any exponential expression can be converted into this form
                            # e = 2.718281828... = Euler's number
                            yy = []
                            for i in range(y.size):
                                yy.append(y[i])
                            yy = np.array(yy)
                            # the following lines give a good initial guess for a and b
                            for i in range(x.size):
                                y[i] = np.log(y[i])
                                
                            res = getLinReg(x, y)
                            a = np.exp(res[1])
                            b = res[0]
                            c = 0
                            def f(arr):
                                return arr[0]*np.exp(arr[1]*x)+arr[2]-yy
                            # leastsq does Gauss-Newton alg (i.e. gradient descent) for us
                            return leastsq(f, [a, b, c])[0]
                        
                        X = np.array([p[0] for p in points])
                        Y = np.array([p[1] for p in points])
                        ans = getExpReg(X, Y)
                    `);
                    let ans = pyodide.globals.toJs().get("ans");
                    lines.push({"type": "exponential", 'A': ans[0], 'B': ans[1], 'C': ans[2], "string": `${ans[0].toFixed(2)}(${(Math.E**ans[1]).toFixed(2)}^x) + ${ans[2].toFixed(2)}`});
                    return;
                }
                if(regressionType == "logarithmic"){
                    pyodide.runPython(`
                        # complete
                        # logarithmic regression is the same as exponential regression
                        # you pass in the parameters (Y, X) instead of (X, Y), and 
                        # then your regression is ln((x-c)/a)/b.
                        import numpy as np
                        from scipy.optimize import leastsq
                    
                        def getLinReg(x, y): 
                            # formula from Mr. Li's MDM4U workbook.
                            cp = 0 
                            sx = 0
                            sx2 = 0
                            sy = 0
                            for i in range(len(x)):
                                cp += x[i]*y[i]
                                sx += x[i]
                                sx2 += x[i]*x[i]
                                sy += y[i]
                    
                            a = (len(x)*cp-sx*sy)/(len(x)*sx2-sx*sx)
                            b = (sy/len(x))-a*(sx/len(x))
                            return [a, b]
                        
                        X = np.linspace(1.0, 8.0, 8)
                        Y = np.array([6, 11.4, 24.6, 54, 87, 204, 381, 786])
                        def getExpReg(x, y):
                            # x and y are list of x and y values
                            # form: a*e^(bx)+c
                            # it can be proven that any exponential expression can be converted into this form
                            # e = 2.718281828... = Euler's number
                            yy = []
                            for i in range(y.size):
                                yy.append(y[i])
                            yy = np.array(yy)
                            # the following lines give a good initial guess for a and b
                            for i in range(x.size):
                                y[i] = np.log(y[i])
                                
                            res = getLinReg(x, y)
                            a = np.exp(res[1])
                            b = res[0]
                            c = 0
                            def f(arr):
                                return arr[0]*np.exp(arr[1]*x)+arr[2]-yy
                            # leastsq does Gauss-Newton alg (i.e. gradient descent) for us
                            return leastsq(f, [a, b, c])[0]
                        
                        X = np.array([p[0] for p in points])
                        Y = np.array([p[1] for p in points])
                        ans = getExpReg(Y, X)
                    `);
                    let ans = pyodide.globals.toJs().get("ans");
                    lines.push({"type": "logarithmic", 'A': ans[0], 'B': ans[1], 'C': ans[2], "string": `ln((x-${ans[2].toFixed(2)}) / ${ans[0].toFixed(2)}) / ${ans[1].toFixed(2)}`});
                    console.log(lines[lines.length-1].string);
                    return;
                }
                if(regressionType == "auto"){

                }
            } 
            catch (err) {
                alert("Regression Error: " + err);
            }
        }
        
        addPython();
    });
}