import { ComplexNumber, Equation, EquationCollection } from "./NewtonsMethodClasses.js";
import { NewtonsMethodGallery, NewtonsMethodGalleryCloseup } from "./NewtonsMethodGallery.js";

let fsCanvas: HTMLCanvasElement;
let galleries: Map<number, NewtonsMethodGallery> = new Map();
let viewer: NewtonsMethodGalleryCloseup;
let firstImage: boolean;

window.onload = initNMApp();

function initNMApp(): void
{
    fsCanvas = <HTMLCanvasElement> document.getElementById("fullScreenCanvas");
    fsCanvas.width = window.screen.width;
    fsCanvas.height = window.screen.height;
    document.documentElement.style.setProperty("--ratio", String(100 * fsCanvas.height / fsCanvas.width) + "%");
    document.getElementById("new").onclick = showMenu;
    document.getElementById("fractalMenu").onclick = startFractals;
    viewer = new NewtonsMethodGalleryCloseup();
}

function showMenu() : void
{
    document.getElementById("imageViewer").style.display = "none";
    document.getElementById("fractalMenu").style.display = "block";
}
    
function startFractals(): void
{
    firstImage = true;
    let equationNumbers: number[] = new Array();
    let equations: EquationCollection = new EquationCollection();
    let collection: HTMLElement = document.getElementById("collection");
    for (let nLoop: number = 1; nLoop <= equations.equationCount; nLoop++)
    {
        equationNumbers.push(nLoop);
        let equation: Equation = equations.getEquation(nLoop);
        galleries.set(nLoop, new NewtonsMethodGallery(collection, equation.HTML, viewer));
    }

    let worker = new Worker("NewtonsMethodWorker.js", {type: "module"});
    worker.onmessage = processMessage;
    worker.postMessage({width: fsCanvas.width, height: fsCanvas.height, equations: equationNumbers});
}

function processMessage(event: MessageEvent) : void
{
    fsCanvas.getContext("2d").drawImage(event.data.imageBitmap, 0, 0);
    let planeData: ComplexNumber[] = new Array();
    for (let nLoop: number = 0; nLoop < event.data.plane.length; nLoop++)
        planeData.push(new ComplexNumber(event.data.plane[nLoop].r, event.data.plane[nLoop].i));
    let rootData: ComplexNumber[] = new Array();
    for (let nLoop: number = 0; nLoop < event.data.roots.length; nLoop++)
        rootData.push(new ComplexNumber(event.data.roots[nLoop].r, event.data.roots[nLoop].i));
    galleries.get(event.data.equationNumber).addImage(fsCanvas.toDataURL(), planeData, rootData, event.data.maxAttempts);
    if (firstImage)
    {
        galleries.get(event.data.equationNumber).showNewestImage();
        firstImage = false;
    }
}