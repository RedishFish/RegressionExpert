//TODO: Allow different degree for polynomial
//BUG:Sin issue and logarithmic not working for negative x-vals

window.mainWorkspaceHandler = function mainWorkspaceHandler() {
    x_scaleBtnHandler();
    y_scaleBtnHandler();
    regressionBtnHandler();
};

function x_scaleBtnHandler() {
    let x_scalePopup = document.getElementsByClassName("x-scale-popup")[0];
    let x_scaleBtn = document.getElementById("x-scale-btn");
    let x_exitBtn = x_scalePopup.getElementsByClassName("exit-btn")[0];
    let x_enterBtn = x_scalePopup.getElementsByClassName("enter-btn")[0];

    x_scaleBtn.addEventListener("click", function () {
        let rect = x_scaleBtn.getBoundingClientRect();
        x_scalePopup.style = `
            display: block;
            position: fixed;
            top: ${rect.bottom}px;
            left: ${rect.left}px;
        `;
    });

    x_exitBtn.addEventListener("click", function () {
        x_scalePopup.style.display = "none";
    });

    x_enterBtn.addEventListener("click", function () {
        let step = parseInt(document.getElementById("x-increment-field").value);
        let substep = parseInt(
            document.getElementById("x-subincrement-field").value,
        );
        let leftLimit = parseInt(
            document.getElementById("x-left-limit-field").value,
        );
        let rightLimit = parseInt(
            document.getElementById("x-right-limit-field").value,
        );
        let x_axisBreak = parseInt(
            document.getElementById("x-axis-break-field").value,
        );

        if ((leftLimit || leftLimit === 0) && (rightLimit || rightLimit === 0))
            X_RANGE = [leftLimit, rightLimit];
        if (step) X_STEP = step;
        if (substep) X_SUBSTEP = substep;
    });
}

function y_scaleBtnHandler() {
    let y_scalePopup = document.getElementsByClassName("y-scale-popup")[0];
    let y_scaleBtn = document.getElementById("y-scale-btn");
    let y_exitBtn = y_scalePopup.getElementsByClassName("exit-btn")[0];
    let y_enterBtn = y_scalePopup.getElementsByClassName("enter-btn")[0];

    y_scaleBtn.addEventListener("click", function () {
        let rect = y_scaleBtn.getBoundingClientRect();
        y_scalePopup.style = `
            display: block;
            position: fixed;
            top: ${rect.bottom}px;
            left: ${rect.left}px;
        `;
    });

    y_exitBtn.addEventListener("click", function () {
        y_scalePopup.style.display = "none";
    });

    y_enterBtn.addEventListener("click", function () {
        let step = parseInt(document.getElementById("y-increment-field").value);
        let substep = parseInt(
            document.getElementById("y-subincrement-field").value,
        );
        let leftLimit = parseInt(
            document.getElementById("y-left-limit-field").value,
        );
        let rightLimit = parseInt(
            document.getElementById("y-right-limit-field").value,
        );
        let y_axisBreak = parseInt(
            document.getElementById("y-axis-break-field").value,
        );

        if ((leftLimit || leftLimit === 0) && (rightLimit || rightLimit === 0))
            Y_RANGE = [leftLimit, rightLimit];
        if (step) Y_STEP = step;
        if (substep) Y_SUBSTEP = substep;
    });
}

function regressionBtnHandler() {
    let regressionPopup =
        document.getElementsByClassName("regression-popup")[0];
    let regressionBtn = document.getElementById("new-regression-btn");
    let regressionExitBtn =
        regressionPopup.getElementsByClassName("exit-btn")[0];
    let regressionEnterBtn =
        regressionPopup.getElementsByClassName("enter-btn")[0];

    regressionBtn.addEventListener("click", function () {
        let rect = regressionBtn.getBoundingClientRect();
        regressionPopup.style = `
            display: block;
            position: fixed;
            top: ${rect.bottom}px;
            left: ${rect.left}px;
        `;
    });

    regressionExitBtn.addEventListener("click", function () {
        regressionPopup.style.display = "none";
    });

    regressionEnterBtn.addEventListener("click", function () {
        let regressionType = document.getElementById(
            "regression-type-selector",
        ).value;
        //console.log(regressionType);

        async function addPython() {
            try {
                pyodide.globals.set("points", points);
                pyodide.runPython(`
                    points = [pt for pt in points if not math.isnan(pt[0]) and not math.isnan(pt[1])]
                `);

                if (regressionType == "linear") {
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
                    let m = pyodide.globals.toJs().get("m");
                    let b = pyodide.globals.toJs().get("b");
                    lines.push({
                        type: "linear",
                        m: m,
                        b: b,
                        string: `y = ${m.toPrecision(4)}x + ${b.toPrecision(4)}`,
                    });

                    pi = [];
                    li = [];
                    for (let _ = 0; _ < points.length; _++) {
                        pi.push(points[_]);
                    }
                    for (let _ = 0; _ < lines.length; _++) {
                        li.push(lines[_]);
                    }
                    stack.push({ l: li, p: pi });
                    dump = [];
                } else if (
                    regressionType == "2" ||
                    regressionType == "3" ||
                    regressionType == "4" ||
                    regressionType == "5"
                ) {
                    pyodide.globals.set("ord", parseInt(regressionType));

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

                    let res = `${coeff[0].toPrecision(4)}`;
                    for (let i = 1; i < coeff.length; i++) {
                        res = `${coeff[i].toPrecision(4)}x^${i} + ${res}`;
                    }

                    lines.push({
                        type: "polynomial",
                        coeff: coeff,
                        string: res,
                    });

                    pi = [];
                    li = [];
                    for (let _ = 0; _ < points.length; _++) {
                        pi.push(points[_]);
                    }
                    for (let _ = 0; _ < lines.length; _++) {
                        li.push(lines[_]);
                    }
                    stack.push({ l: li, p: pi });
                    dump = [];
                } else if (regressionType == "sinusoidal") {
                    pyodide.runPython(`
                        import numpy, scipy.optimize
                        def fit_sin(tt, yy):
                            tt = numpy.array(tt)
                            yy = numpy.array(yy)
                            ff = numpy.fft.fftfreq(len(tt), (tt[1]-tt[0]))   # assume uniform spacing
                            Fyy = abs(numpy.fft.fft(yy))
                            guess_freq = abs(ff[numpy.argmax(Fyy[1:])+1])   # excluding the zero frequency "peak", which is related to offset
                            guess_amp = numpy.std(yy) * 2.**0.5
                            guess_offset = numpy.mean(yy)
                            guess = numpy.array([guess_amp, 2.*numpy.pi*guess_freq, 0., guess_offset])
                        
                            def sinfunc(t, A, w, p, c):  return A * numpy.sin(w*t + p) + c
                            popt, pcov = scipy.optimize.curve_fit(sinfunc, tt, yy, p0=guess)
                            A, w, p, c = popt
                            f = w/(2.*numpy.pi)
                            fitfunc = lambda t: A * numpy.sin(w*t + p) + c
                            return [A, w, p, c]
                        

                        X = np.array([p[0] for p in points])
                        Y = np.array([p[1] for p in points])
                        ans = fit_sin(X, Y)
                    `);
                    let ans = pyodide.globals.toJs().get("ans");
                    lines.push({
                        type: "sinusoidal",
                        A: ans[0],
                        B: ans[1],
                        C: ans[2],
                        D: ans[3],
                        string: `${ans[0].toPrecision(4)}sin(${ans[1].toPrecision(4)}x + ${ans[2].toPrecision(4)}) + ${ans[3].toPrecision(4)}`,
                    });

                    pi = [];
                    li = [];
                    for (let _ = 0; _ < points.length; _++) {
                        pi.push(points[_]);
                    }
                    for (let _ = 0; _ < lines.length; _++) {
                        li.push(lines[_]);
                    }
                    stack.push({ l: li, p: pi });
                    dump = [];
                } else if (regressionType == "exponential") {
                    pyodide.runPython(`
                        # complete
                        # logarithmic regression is the same as exponential regression
                        # you pass in the parameters (Y, X) instead of (X, Y), and 
                        # then your regression is ln((x-c)/a)/b.
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
                    lines.push({
                        type: "exponential",
                        A: ans[0],
                        B: ans[1],
                        C: ans[2],
                        string: `${ans[0].toPrecision(4)}(${(Math.E ** ans[1]).toPrecision(4)}^x) + ${ans[2].toPrecision(4)}`,
                    });

                    pi = [];
                    li = [];
                    for (let _ = 0; _ < points.length; _++) {
                        pi.push(points[_]);
                    }
                    for (let _ = 0; _ < lines.length; _++) {
                        li.push(lines[_]);
                    }
                    stack.push({ l: li, p: pi });
                    dump = [];
                } else if (regressionType == "logarithmic") {
                    pyodide.runPython(`
                        # complete
                        # logarithmic regression is the same as exponential regression
                        # you pass in the parameters (Y, X) instead of (X, Y), and 
                        # then your regression is ln((x-c)/a)/b.                   
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
                    lines.push({
                        type: "logarithmic",
                        A: ans[0],
                        B: ans[1],
                        C: ans[2],
                        string: `ln((x-${ans[2].toPrecision(4)}) / ${ans[0].toPrecision(4)}) / ${ans[1].toPrecision(4)}`,
                    });
                    console.log(lines[lines.length - 1].string);

                    pi = [];
                    li = [];
                    for (let _ = 0; _ < points.length; _++) {
                        pi.push(points[_]);
                    }
                    for (let _ = 0; _ < lines.length; _++) {
                        li.push(lines[_]);
                    }
                    stack.push({ l: li, p: pi });
                    dump = [];
                }
                appendToRegressionsTable_(lines[lines.length - 1]);
            } catch (err) {
                alert("Regression Error: " + err);
            }
        }

        addPython();
    });
}
