/*!
    Newton's Method project
    Copyright 2020 Mount Si Software, LLC
*/
class complexNumber {
    constructor(r, i) {
        this.r = r;
        this.i = i;
    }
    get real() { return this.r; }
    get imaginary() { return this.i; }
    distance(other) {
        let diffR = this.r - other.r;
        let diffI = this.i - other.i;
        // correct for math class: return Math.sqrt(diffR * diffR + diffI * diffI);
        // however, our numbers are so small it doesn't matter
        return diffR * diffR + diffI * diffI;
    }
    add(other) {
        return new complexNumber(this.r + other.r, this.i + other.i);
    }
    subtract(other) {
        return new complexNumber(this.r - other.r, this.i - other.i);
    }
    multiply(other) {
        return new complexNumber(this.r * other.r + this.i * other.i * -1, this.r * other.i + this.i * other.r);
    }
    divide(other) {
        return new complexNumber((this.r * other.r + this.i * other.i) / (other.r * other.r + other.i * other.i), (this.i * other.r - this.r * other.i) / (other.r * other.r + other.i * other.i));
    }
    toString() {
        return "(" + this.r + ", " + this.i + ")";
    }
}
class equation {
    constructor() {
        this.HTMLString = "";
    }
}
class polynomial extends equation {
    // coefficients is an array of numbers used as coefficients for
    // the respective power elements of a polynomial equation.
    // coefficients are ordered in the reverse of how they would be written.
    // for x^3 - 1, the array would have values [-1, 0, 0, 1];
    // for 8x^2 + 3x - 12, the array would have values [-12, 3, 8];
    constructor(coefficients) {
        super();
        // save off coefficients
        this.equationCoefs = coefficients;
        // make the derivative coefficients
        // if f(x) = x^3 - 1, f'(x) = 3x^2
        // [-1, 0, 0, 1] -> [0, 0, 3];
        this.derivativeCoefs = new Array(this.equationCoefs.length - 1);
        let nLoop;
        for (nLoop = 0; nLoop < this.derivativeCoefs.length; nLoop++)
            this.derivativeCoefs[nLoop] = this.equationCoefs[nLoop + 1] * (nLoop + 1);
        // make the HTML string
        for (nLoop = coefficients.length - 1; nLoop >= 0; nLoop--) {
            let coef = coefficients[nLoop];
            if (this.HTMLString.length == 0)
                this.HTMLString = String(coef) + this.formatExponent(nLoop);
            else if (coef > 0)
                this.HTMLString += " + " + String(coef) + this.formatExponent(nLoop);
            else if (coef < 0)
                this.HTMLString += " - " + String(0 - coef) + this.formatExponent(nLoop);
        }
    }
    formatExponent(expValue) {
        if (expValue == 0)
            return "";
        if (expValue == 1)
            return "x";
        return "x<sup>" + expValue + "</sup>";
    }
    equationValue(point) { return this.formulaValue(this.equationCoefs, point); }
    derivativeValue(point) { return this.formulaValue(this.derivativeCoefs, point); }
    formulaValue(formula, point) {
        let value = new complexNumber(formula[0], 0);
        let pointRaised = new complexNumber(1, 0);
        let nLoop;
        for (nLoop = 1; nLoop < formula.length; nLoop++) {
            pointRaised = pointRaised.multiply(point);
            value = value.add(pointRaised.multiply(new complexNumber(formula[nLoop], 0)));
        }
        return value;
    }
}
class newtonsMethodResult {
    constructor(finalPoint, attempts, rootIndex) {
        this.finalPoint = finalPoint;
        this.attempts = attempts;
        this.rootIndex = rootIndex;
    }
    toString() { return "(" + this.finalPoint.toString() + ", " + this.attempts + ", " + this.rootIndex + ")"; }
}
class newtonsMethod {
    constructor(exponent, maxAttempts, coefficient = new complexNumber(1, 0)) {
        this.exponent = exponent;
        this.maxAttempts = maxAttempts;
        this.coefficient = coefficient;
        this.roots = [];
        this.tolerance = 0.00001;
        this.constOne = new complexNumber(1, 0);
        let nLoop, angle;
        for (nLoop = 0; nLoop < this.exponent; nLoop++) {
            angle = 2 * Math.PI * nLoop / this.exponent;
            this.roots.push(new complexNumber(Math.cos(angle), Math.sin(angle)));
        }
        this.constExponent = new complexNumber(this.exponent, 0);
    }
    solve(point) {
        let nextPoint = this.evaluate(point);
        let iterations = 1;
        while (nextPoint.distance(point) > this.tolerance && iterations < this.maxAttempts) {
            point = nextPoint;
            nextPoint = this.evaluate(point);
            iterations++;
        }
        let rootIndex = -1;
        if (nextPoint.distance(point) <= this.tolerance) {
            let distance = Number.MAX_SAFE_INTEGER;
            let nLoop, newDistance;
            for (nLoop = 0; nLoop < this.roots.length; nLoop++) {
                newDistance = this.roots[nLoop].distance(nextPoint);
                if (newDistance < distance) {
                    distance = newDistance;
                    rootIndex = nLoop;
                }
            }
        }
        return new newtonsMethodResult(nextPoint, iterations, rootIndex);
    }
    evaluate(point) {
        let nLoop;
        let xN = point;
        let xNMinusOne;
        for (nLoop = 2; nLoop <= this.exponent; nLoop++) {
            xNMinusOne = xN;
            xN = xN.multiply(point);
        }
        let numerator = xN.subtract(this.constOne);
        let denomonator = xNMinusOne.multiply(this.constExponent);
        return point.subtract(this.coefficient.multiply(numerator.divide(denomonator)));
    }
}
class imageInfo {
    constructor(data, text) {
        this.data = data;
        this.text = text;
    }
}
let height, width, ctx;
let startingPoints = [], results = [];
let gradients = [4, 8, 16, 32, 64];
let exponents = [3, 4, 5, 6];
let colors = [];
let algorithms = [];
let images = [];
let nImageShown;
let statusSummary, statusDetails;
function setHandlers(flag) {
    if (flag == true) {
        document.addEventListener("click", drawFractals, false);
        document.addEventListener("touchstart", drawFractals, false);
    }
    else {
        document.removeEventListener("click", drawFractals, false);
        document.removeEventListener("touchstart", drawFractals, false);
    }
}
function drawFractals() {
    setHandlers(false);
    statusSummary = document.getElementById("statusSummary");
    statusSummary.innerText = "Calculating coordinates";
    let canvas = document.getElementById("myCanvas");
    let body = document.getElementById("myBody");
    width = canvas.width = body.offsetWidth;
    height = canvas.height = body.offsetHeight;
    let ySize = 3;
    let xSize = width * 3 / height;
    if (xSize < 3) {
        xSize = 3;
        ySize = height * 3 / width;
    }
    console.log("Sizes: (" + width + ", " + height + ") => (" + xSize + ", " + ySize + ") => " + Math.hypot(xSize, ySize));
    let xStart = 0 - xSize / 2;
    let yStart = ySize / 2;
    console.log("Computing starting points ...");
    let xPos;
    for (xPos = 0; xPos < width; xPos++) {
        let xCoordinate = xStart + ((xPos / width) * xSize);
        let point = new complexNumber(xCoordinate, yStart);
        startingPoints.push(point);
    }
    let yPos;
    for (yPos = 1; yPos < height; yPos++) {
        let yCoordinate = yStart - ((yPos / height) * ySize);
        for (xPos = 0; xPos < width; xPos++) {
            let point = new complexNumber(startingPoints[xPos].real, yCoordinate);
            startingPoints.push(point);
        }
    }
    console.log("... completed");
    colors.length = 0;
    colors.push(new Array(255, 0, 0));
    colors.push(new Array(0, 127, 0));
    colors.push(new Array(0, 0, 255));
    colors.push(new Array(255, 255, 0));
    colors.push(new Array(127, 0, 127));
    colors.push(new Array(255, 127, 0));
    algorithms.length = 0;
    images.length = 0;
    ctx = canvas.getContext("2d");
    drawFractalRoots(0);
}
function drawFractalRoots(exponentIndex) {
    if (exponentIndex < exponents.length) {
        let maxAttempts = gradients[gradients.length - 1];
        let algo = new newtonsMethod(exponents[exponentIndex], maxAttempts, new complexNumber(1, 0));
        algorithms.push(algo);
        results.length = 0;
        let index;
        statusSummary.innerHTML = "Solving x<sup>" + exponents[exponentIndex] + "</sup> - 1 for " + startingPoints.length + " points";
        console.log("Computing final points for " + exponents[exponentIndex] + " roots with " + maxAttempts + " gradients ...");
        for (index = 0; index < startingPoints.length; index++)
            results.push(algo.solve(startingPoints[index]));
        console.log("... completed");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        drawFractalRootsGradients(exponentIndex, 0);
    }
    else {
        let elem = document.getElementById("prev");
        elem.innerText = "<- Previous";
        elem.onclick = previousImage;
        elem = document.getElementById("next");
        elem.innerText = "Next ->";
        elem.onclick = nextImage;
        nImageShown = images.length - 1;
        document.addEventListener("keydown", function (event) {
            if (event.keyCode == 37)
                previousImage();
            else if (event.keyCode == 39)
                nextImage();
        });
    }
}
function drawFractalRootsGradients(exponentIndex, gradientIndex) {
    if (gradientIndex < gradients.length) {
        statusSummary.innerHTML = "Drawing roots for x<sup>" + exponents[exponentIndex] + "</sup> - 1 reached within " + gradients[gradientIndex] + " attempts";
        let yPos, xPos;
        for (yPos = 0; yPos < height; yPos++)
            setTimeout(drawFractalLine, 0, yPos, gradients[gradientIndex]);
        setTimeout(storeFractalImage, 0);
        setTimeout(drawFractalRootsGradients, 0, exponentIndex, gradientIndex + 1);
    }
    else
        setTimeout(drawFractalRoots, 0, exponentIndex + 1);
}
function drawFractalLine(yPos, nGradients) {
    let xPos, index = width * yPos;
    for (xPos = 0; xPos < width; xPos++, index++) {
        let pixelColor;
        let rootIndex = results[index].rootIndex;
        let attempts = results[index].attempts;
        if (attempts > nGradients || rootIndex == -1)
            pixelColor = "black";
        else
            pixelColor = "rgba(" + colors[rootIndex][0] + ", " + colors[rootIndex][1] + ", " + colors[rootIndex][2] + ", " + (1 - (attempts - 1) / nGradients) + ")";
        ctx.fillStyle = pixelColor;
        ctx.fillRect(xPos, yPos, 1, 1);
    }
}
function storeFractalImage() {
    images.push(new imageInfo(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height), statusSummary.innerHTML));
}
function previousImage() {
    nImageShown--;
    if (nImageShown < 0)
        nImageShown = images.length - 1;
    displayImage();
}
function nextImage() {
    nImageShown++;
    if (nImageShown >= images.length)
        nImageShown = 0;
    displayImage();
}
function displayImage() {
    ctx.putImageData(images[nImageShown].data, 0, 0);
    statusSummary.innerHTML = images[nImageShown].text;
}
