/*!
    Newton's Method project
    Copyright 2020 Mount Si Software, LLC
*/

import { ComplexNumber, Equation, SimplePolynomial } from "./NewtonsMethodClasses.js"

class NewtonsMethodResult
{
    constructor(private finalPoint: ComplexNumber, public attempts: number, public rootIndex: number) {}
    toString() : string { return "(" + this.finalPoint.toString() + ", " + this.attempts + ", " + this.rootIndex + ")"; }
}

class NewtonsMethod
{
    private roots: ComplexNumber[] = [];
    public get rootCount(): number { return this.roots.length; }
    private tolerance: number = 0.00001;

    constructor(private equation: Equation, private maxAttempts: number, private coefficient: ComplexNumber = new ComplexNumber(1, 0))
    {
        this.roots = equation.roots;
    }
            
    solve(point: ComplexNumber): NewtonsMethodResult
    {
        let nextPoint: ComplexNumber = this.evaluate(point);
        let iterations: number = 1;
        while (nextPoint.distance(point) > this.tolerance && iterations < this.maxAttempts)
        {
            point = nextPoint;
            nextPoint = this.evaluate(point);
            iterations++;
        }
        
        let rootIndex = -1;
        if (nextPoint.distance(point) <= this.tolerance)
        {
            let distance: number = Number.MAX_SAFE_INTEGER;
            let nLoop: number, newDistance: number;
            for (nLoop = 0; nLoop < this.roots.length; nLoop++)
            {
                newDistance = this.roots[nLoop].distance(nextPoint);
                if (newDistance < distance)
                {
                    distance = newDistance;
                    rootIndex = nLoop;
                }
            }
        }
        
        return new NewtonsMethodResult(nextPoint, iterations, rootIndex); 
    }
    
    evaluate(point: ComplexNumber)
    {
        let numerator: ComplexNumber = this.equation.equationValue(point);
        let denomonator: ComplexNumber = this.equation.derivativeValue(point);
        return point.subtract(numerator.divide(denomonator));
    }
}

class ImageInfo
{
    constructor(public data: ImageData, public text: string) {}
}

let height: number, width: number, ctx: CanvasRenderingContext2D;
let startingPoints: ComplexNumber[] = [], results: NewtonsMethodResult[] = [];
let gradients: number[] = [4, 8, 16, 32, 64];
let equations: Equation[] = [];
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
    statusSummary.innerText = "Calculating coordinates";
    let canvas: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("myCanvas");
    let body: HTMLBodyElement = <HTMLBodyElement> document.getElementById("myBody");
    width = canvas.width = body.offsetWidth;
    height = canvas.height = body.offsetHeight;
    let ySize: number = 3;
    let xSize: number = width * 3 / height;
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

function drawFractalRoots(equationIndex: number) : void
{
    if (equationIndex < equations.length)
    {
        let equation: Equation = equations[equationIndex];
        let maxAttempts: number = gradients[gradients.length - 1];
        let algo: NewtonsMethod = new NewtonsMethod(equation, maxAttempts, new ComplexNumber(1, 0));
        results.length = 0;
        let index: number;
        statusSummary.innerHTML = "Solving " + equation.HTML + " for " + startingPoints.length + " points";
        console.log("Computing final points for " + algo.rootCount + " roots with " + maxAttempts + " gradients ...");
        for (index = 0; index < startingPoints.length; index++) results.push(algo.solve(startingPoints[index]));
        console.log("... completed");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        drawFractalRootsGradients(equationIndex, 0);
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
            if (event.keyCode == 37) previousImage();
            else if (event.keyCode == 39) nextImage();
        });
    }
}

function drawFractalRootsGradients(equationIndex: number, gradientIndex: number) : void
{
    if (gradientIndex < gradients.length)
    {
        statusSummary.innerHTML = "Drawing roots for " + equations[equationIndex].HTML + " reached within " + gradients[gradientIndex] + " attempts";
        let yPos: number, xPos: number;
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
        if (attempts > nGradients || rootIndex == -1)
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
