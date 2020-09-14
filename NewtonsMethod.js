/*!
    Newton's Method project
    Copyright 2020 Mount Si Software, LLC
*/
import { ComplexNumber, SimplePolynomial } from "./NewtonsMethodClasses.js";
class NewtonsMethodResult {
    constructor(finalPoint, attempts, rootIndex) {
        this.finalPoint = finalPoint;
        this.attempts = attempts;
        this.rootIndex = rootIndex;
    }
    toString() { return "(" + this.finalPoint.toString() + ", " + this.attempts + ", " + this.rootIndex + ")"; }
}
class NewtonsMethod {
    constructor(equation, maxAttempts, coefficient = new ComplexNumber(1, 0)) {
        this.equation = equation;
        this.maxAttempts = maxAttempts;
        this.coefficient = coefficient;
        this.roots = [];
        this.tolerance = 0.00001;
        this.roots = equation.roots;
    }
    get rootCount() { return this.roots.length; }
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
        return new NewtonsMethodResult(nextPoint, iterations, rootIndex);
    }
    evaluate(point) {
        let numerator = this.equation.equationValue(point);
        let denomonator = this.equation.derivativeValue(point);
        return point.subtract(numerator.divide(denomonator));
    }
}
class ImageInfo {
    constructor(data, text) {
        this.data = data;
        this.text = text;
    }
}
let height, width, ctx;
let startingPoints = [], results = [];
let gradients = [4, 8, 16, 32, 64];
let equations = [];
let colors = [];
let images = [];
let nImageShown;
let statusSummary;
window.onload = window.onpageshow = function () {
    setHandlers(true);
};
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
        let point = new ComplexNumber(xCoordinate, yStart);
        startingPoints.push(point);
    }
    let yPos;
    for (yPos = 1; yPos < height; yPos++) {
        let yCoordinate = yStart - ((yPos / height) * ySize);
        for (xPos = 0; xPos < width; xPos++) {
            let point = new ComplexNumber(startingPoints[xPos].real, yCoordinate);
            startingPoints.push(point);
        }
    }
    console.log("... completed");
    console.log("Creating equations ...");
    equations.push(new SimplePolynomial(3));
    equations.push(new SimplePolynomial(4));
    equations.push(new SimplePolynomial(5));
    equations.push(new SimplePolynomial(6));
    console.log("... completed");
    colors.length = 0;
    colors.push(new Array(255, 0, 0));
    colors.push(new Array(0, 127, 0));
    colors.push(new Array(0, 0, 255));
    colors.push(new Array(255, 255, 0));
    colors.push(new Array(127, 0, 127));
    colors.push(new Array(255, 127, 0));
    images.length = 0;
    ctx = canvas.getContext("2d");
    drawFractalRoots(0);
}
function drawFractalRoots(equationIndex) {
    if (equationIndex < equations.length) {
        let equation = equations[equationIndex];
        let maxAttempts = gradients[gradients.length - 1];
        let algo = new NewtonsMethod(equation, maxAttempts, new ComplexNumber(1, 0));
        results.length = 0;
        let index;
        statusSummary.innerHTML = "Solving " + equation.HTML + " for " + startingPoints.length + " points";
        console.log("Computing final points for " + algo.rootCount + " roots with " + maxAttempts + " gradients ...");
        for (index = 0; index < startingPoints.length; index++)
            results.push(algo.solve(startingPoints[index]));
        console.log("... completed");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        drawFractalRootsGradients(equationIndex, 0);
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
function drawFractalRootsGradients(equationIndex, gradientIndex) {
    if (gradientIndex < gradients.length) {
        statusSummary.innerHTML = "Drawing roots for " + equations[equationIndex].HTML + " reached within " + gradients[gradientIndex] + " attempts";
        let yPos, xPos;
        for (yPos = 0; yPos < height; yPos++)
            setTimeout(drawFractalLine, 0, yPos, gradients[gradientIndex]);
        setTimeout(storeFractalImage, 0);
        setTimeout(drawFractalRootsGradients, 0, equationIndex, gradientIndex + 1);
    }
    else
        setTimeout(drawFractalRoots, 0, equationIndex + 1);
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
    images.push(new ImageInfo(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height), statusSummary.innerHTML));
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
