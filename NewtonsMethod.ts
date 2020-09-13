/*!
    Newton's Method project
    Copyright 2020 Mount Si Software, LLC
*/

class ComplexNumber
{
    constructor(private r: number, private i: number) {}
    public get real(): number { return this.r; }
    public get imaginary(): number { return this.i; }
    
    distance(other: ComplexNumber) : number
    {
        let diffR: number = this.r - other.r;
        let diffI: number = this.i - other.i;
        // correct for math class: return Math.sqrt(diffR * diffR + diffI * diffI);
        // however, our numbers are so small it doesn't matter
        return diffR * diffR + diffI * diffI;
    }
    
    add(other: ComplexNumber) : ComplexNumber
    {
        return new ComplexNumber(this.r + other.r, this.i + other.i);
    }
    
    subtract(other: ComplexNumber) : ComplexNumber
    {
        return new ComplexNumber(this.r - other.r, this.i - other.i);
    }
    
    multiply(other: ComplexNumber) : ComplexNumber
    {
        return new ComplexNumber(this.r * other.r + this.i * other.i * -1,
            this.r * other.i + this.i * other.r);
    }
    
    divide(other: ComplexNumber) : ComplexNumber
    {
        return new ComplexNumber((this.r * other.r + this.i * other.i) / (other.r * other.r + other.i * other.i),
            (this.i * other.r - this.r * other.i) / (other.r * other.r + other.i * other.i));
    }
    
    toString() : string
    {
        return "(" + this.r + ", " + this.i + ")";
    }
}

abstract class Equation
{
    protected HTMLString: string = "";

    public abstract equationValue(point: ComplexNumber) : ComplexNumber
    public abstract derivativeValue(point: ComplexNumber) : ComplexNumber
    public abstract get roots() : ComplexNumber[];
    public abstract get rootCount() : number;

    public get HTML() { return this.HTMLString; }
}

class Polynomial extends Equation
{
    private equationCoefs: number[];
    private derivativeCoefs: number[];
    private numRoots: number = 0;

    // coefficients is an array of numbers used as coefficients for
    // the respective power elements of a polynomial equation.
    // coefficients are ordered in the reverse of how they would be written.
    // for x^3 - 1, the array would have values [-1, 0, 0, 1];
    // for 8x^2 + 3x - 12, the array would have values [-12, 3, 8];
    constructor(coefficients: number[])
    {
        super();

        // save off coefficients
        this.equationCoefs = coefficients;

        // make the derivative coefficients
        // if f(x) = x^3 - 1, f'(x) = 3x^2
        // [-1, 0, 0, 1] -> [0, 0, 3];
        this.derivativeCoefs = new Array(this.equationCoefs.length - 1);
        let nLoop: number;
        for (nLoop = 0; nLoop < this.derivativeCoefs.length; nLoop++)
            this.derivativeCoefs[nLoop] = this.equationCoefs[nLoop + 1] * (nLoop + 1);

        // make the HTML string
        for (nLoop = coefficients.length - 1; nLoop >= 0; nLoop--)
        {
            let coef: number = coefficients[nLoop];
            if (this.HTMLString.length == 0)
            {
                let strCoef: string = coef == 1 ? "" : coef == -1 ? "-" : String(coef);
                this.HTMLString = strCoef + this.formatExponent(nLoop);
            }
            else if (coef > 0)
                this.HTMLString += " + " + String(coef) + this.formatExponent(nLoop);
            else if (coef < 0)
                this.HTMLString += " - " + String(0 - coef) + this.formatExponent(nLoop);
        }
    }

    formatExponent(expValue: number) : string
    {
        if (expValue == 0) return "";
        if (expValue == 1) return "x";
        return "x<sup>" + expValue + "</sup>";
    }

    equationValue(point: ComplexNumber) { return this.formulaValue(this.equationCoefs, point); }
    derivativeValue(point: ComplexNumber) { return this.formulaValue(this.derivativeCoefs, point); }
    formulaValue(formula: number[], point: ComplexNumber) : ComplexNumber
    {
        let value: ComplexNumber = new ComplexNumber(formula[0], 0);
        let pointRaised: ComplexNumber = new ComplexNumber(1, 0);
        let nLoop: number;
        for (nLoop = 1; nLoop < formula.length; nLoop++)
        {
            pointRaised = pointRaised.multiply(point);
            value = value.add(pointRaised.multiply(new ComplexNumber(formula[nLoop], 0)));
        }
        return value;
    }

    get roots() : ComplexNumber[]
    {
        // make a horrible, terrible, absolutely awful assumption
        // that all polynomial equations we'll actually process are of the form
        // x^y - c = 0
        let roots: ComplexNumber[] = [];
        let nLoop: number, angle: number, exponent: number = this.equationCoefs.length - 1;
        let constant: number = Math.abs(this.equationCoefs[0]);
        for (nLoop = 0; nLoop < exponent; nLoop++)
        {
            angle = 2 * Math.PI * nLoop / exponent;
            roots.push(new ComplexNumber(constant * Math.cos(angle), constant * Math.sin(angle)));
        }
        this.numRoots = roots.length;
        return roots;
    }

    get rootCount() { return this.numRoots; }
}

class NewtonsMethodResult
{
    constructor(private finalPoint: ComplexNumber, public attempts: number, public rootIndex: number) {}
    toString() : string { return "(" + this.finalPoint.toString() + ", " + this.attempts + ", " + this.rootIndex + ")"; }
}

class NewtonsMethod
{
    private roots: ComplexNumber[] = [];
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
let exponents: number[] = [3, 4, 5, 6];
let equations: Equation[] = [];
let colors: number[][] = [];
let images: ImageInfo[] = [];
let nImageShown: number;
let statusSummary: HTMLDivElement, statusDetails: HTMLDivElement;

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
    equations.push(new Polynomial([-1, 0, 0, 1]));
    equations.push(new Polynomial([-1, 0, 0, 0, 1]));
    equations.push(new Polynomial([-1, 0, 0, 0, 0, 1]));
    equations.push(new Polynomial([-1, 0, 0, 0, 0, 0, 1]));
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
        console.log("Computing final points for " + equation.rootCount + " roots with " + maxAttempts + " gradients ...");
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
