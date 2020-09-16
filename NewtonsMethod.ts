/*!
    Newton's Method project
    Copyright 2020 Mount Si Software, LLC
*/

import { ComplexNumber, Equation, Polynomial, SimplePolynomial } from "./NewtonsMethodClasses.js"
import { NewtonsMethod, NewtonsMethodResult, RootWell } from "./NewtonsMethodAlgorithm.js"

class ImageInfo
{
    constructor(public data: ImageData, public text: string) {}
}

let height: number, width: number;
let xSize: number, ySize: number;
let ctx: CanvasRenderingContext2D;
let telemetryStyle: CSSStyleDeclaration;
let startingPoints: ComplexNumber[] = [], results: NewtonsMethodResult[] = [];
let gradients: number[] = [4, 8, 16, 32, 64];
let equations: Equation[] = [];
let algo: NewtonsMethod;
let colors: number[][] = [];
let images: ImageInfo[] = [];
let nImageShown: number;
let statusSummary: HTMLDivElement;

window.onload = window.onpageshow = function() {
    setHandlers(true);
}

function setHandlers(flag: boolean) : void
{
    if (flag == true)
    {
        document.addEventListener("click", drawFractals, false);
        document.addEventListener("touchstart", drawFractals, false);
    }
    else
    {
        document.removeEventListener("click", drawFractals, false);
        document.removeEventListener("touchstart", drawFractals, false);
    }
}

function drawFractals() : void
{
    setHandlers(false);
    statusSummary = <HTMLDivElement> document.getElementById("statusSummary");
    telemetryStyle = window.getComputedStyle(statusSummary);
    statusSummary.innerText = "Calculating coordinates";
    let canvas: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("myCanvas");
    let body: HTMLBodyElement = <HTMLBodyElement> document.getElementById("myBody");
    width = canvas.width = body.offsetWidth;
    height = canvas.height = body.offsetHeight;
    ySize = 3;
    xSize = width * 3 / height;
    if (xSize < 3)
    {
        xSize = 3;
        ySize = height * 3 / width;
    }
    console.log("Sizes: (" + width + ", " + height + ") => (" + xSize + ", " + ySize + ") => " + Math.hypot(xSize, ySize));
    let xStart: number = 0 - xSize / 2;
    let yStart: number = ySize / 2;
    
    console.log("Computing starting points ...");
    let xPos: number;
    for (xPos = 0; xPos < width; xPos++)
    {
        let xCoordinate: number = xStart + ((xPos / width) * xSize);
        let point: ComplexNumber = new ComplexNumber(xCoordinate, yStart); 
        startingPoints.push(point);
    }
    let yPos: number;
    for (yPos = 1; yPos < height; yPos++)
    {
        let yCoordinate: number = yStart - ((yPos / height) * ySize);
        for (xPos = 0; xPos < width; xPos++)
        {
            let point: ComplexNumber = new ComplexNumber(startingPoints[xPos].real, yCoordinate);
            startingPoints.push(point);
        }
    }
    console.log("... completed");

    console.log("Creating equations ...");
    equations.push(new SimplePolynomial(3));
    /* equations.push(new SimplePolynomial(4));
    equations.push(new SimplePolynomial(5));
    equations.push(new SimplePolynomial(6)); */
    equations.push(new Polynomial([2, -2, 0, 1]));
    equations.push(new Polynomial([-1, 0, 0, 1, 0, 0, 1]));
    equations.push(new Polynomial([-16, 0, 0, 0, 15, 0, 0, 0, 1]));
    console.log("... completed");

    colors.length = 0;
    colors.push(new Array(255, 0, 0));
    colors.push(new Array(0, 127, 0));
    colors.push(new Array(0, 0, 255));
    colors.push(new Array(255, 255, 0));
    colors.push(new Array(127, 0, 127));
    colors.push(new Array(255, 127, 0));
    colors.push(new Array(191, 191, 191));
    colors.push(new Array(63, 63, 63));
    
    images.length = 0;

    ctx = canvas.getContext("2d", { alpha: false });

    drawFractalRoots(0);
}

function drawFractalRoots(equationIndex: number) : void
{
    if (equationIndex < equations.length)
    {
        let equation: Equation = equations[equationIndex];
        let maxAttempts: number = gradients[gradients.length - 1];
        algo = new NewtonsMethod(equation, maxAttempts);
        results.length = 0;
        statusSummary.innerHTML = "Solving " + equation.HTML + " for " + startingPoints.length + " points";
        console.log("Computing final points for " + algo.rootCount + " roots with " + maxAttempts + " gradients ...");
        drawRootWells();
        setTimeout(drawFractalRootsGradients, 0, equationIndex, 0);
    }
    else
    {
        let elem: HTMLDivElement = <HTMLDivElement> document.getElementById("prev");
        elem.innerText = "<- Previous";
        elem.onclick = previousImage;
        elem = <HTMLDivElement> document.getElementById("next");
        elem.innerText = "Next ->";
        elem.onclick = nextImage;
        nImageShown = images.length - 1;
        document.addEventListener("keydown", function(event)
        {
            if (event.code == "ArrowLeft") previousImage();
            else if (event.code == "ArrowRight") nextImage();
            event.preventDefault();
        });
    }
}

function drawRootWells()
{
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    let yPos: number;
    for (yPos = 0; yPos < height; yPos++) setTimeout(updateRootWells, 0, yPos * width, width);
}

function updateRootWells(firstPoint, points)
{
    for (let index: number = firstPoint; index < (firstPoint + points); index++)
        results.push(algo.solve(startingPoints[index]));
    let wells: RootWell[] = algo.wellsInfo;
    for (let nLoop: number = 0; nLoop < wells.length; nLoop++)
    {
        let well: RootWell = wells[nLoop];
        let center: ComplexNumber = well.centerPoint;
        let x: number = realToPixels(center.real);
        let y: number = imaginaryToPixels(center.imaginary);
        let r: number = Math.ceil(Math.sqrt(well.size / Math.PI));
        let gradient: CanvasGradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, "rgb(" + colors[nLoop][0] + ", " + colors[nLoop][1] + ", " + colors[nLoop][2] + ")");
        gradient.addColorStop(0.5, "rgba(" + colors[nLoop][0] + ", " + colors[nLoop][1] + ", " + colors[nLoop][2] + ", 0.8)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();

        let fontSize: number = Math.max(10, Math.floor(r / 2.1));
        ctx.font = String(fontSize) + "px " + telemetryStyle.fontFamily;
        let strPoints: string = String(well.size) + " points";
        ctx.fillStyle = "black";
        ctx.fillText(center.toPlusMinus(2), x, y - Math.ceil(r / 2), Math.floor(1.5 * r));
        ctx.fillText(strPoints, x, y + Math.ceil(r / 20), Math.floor(1.5 * r));
    }
}

function realToPixels(coordinate: number) { return Math.floor(width * (coordinate + (xSize / 2)) / xSize); }
function imaginaryToPixels(coordinate: number) { return Math.floor(height * ((ySize / 2) - coordinate) / ySize); }

function drawFractalRootsGradients(equationIndex: number, gradientIndex: number) : void
{
    if (gradientIndex < gradients.length)
    {
        statusSummary.innerHTML = "Drawing roots for " + equations[equationIndex].HTML + " reached within " + gradients[gradientIndex] + " attempts";
        if (gradientIndex == 0) ctx.clearRect(0, 0, width, height);
        let yPos: number;
        for (yPos = 0; yPos < height; yPos++) setTimeout(drawFractalLine, 0, yPos, gradients[gradientIndex]);
        setTimeout(storeFractalImage, 0);
        setTimeout(drawFractalRootsGradients, 0, equationIndex, gradientIndex + 1);
    }
    else setTimeout(drawFractalRoots, 0, equationIndex + 1);
}

function drawFractalLine(yPos: number, nGradients: number) : void
{
    let xPos: number, index: number = width * yPos;
    for (xPos = 0; xPos < width; xPos++, index++)
    {
        let pixelColor: string;
        let rootIndex: number = results[index].rootIndex;
        let attempts: number = results[index].attempts;
        if (attempts > nGradients || rootIndex == -1 || results[index].rootWithinTolerance == false)
            pixelColor = "black"; 
        else
            pixelColor = "rgba(" + colors[rootIndex][0] + ", " + colors[rootIndex][1] + ", " + colors[rootIndex][2] + ", " + (1 - (attempts - 1) / nGradients) + ")";
        ctx.fillStyle = pixelColor;
        ctx.fillRect(xPos, yPos, 1, 1);
    }
}

function storeFractalImage() : void
{
    images.push(new ImageInfo(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height), statusSummary.innerHTML));
}	

function previousImage() : void
{
    nImageShown--;
    if (nImageShown < 0) nImageShown = images.length - 1;
    displayImage();
}

function nextImage() : void
{
    nImageShown++;
    if (nImageShown >= images.length) nImageShown = 0;
    displayImage();
}

function displayImage() : void
{
    ctx.putImageData(images[nImageShown].data, 0, 0);
    statusSummary.innerHTML = images[nImageShown].text;
}
