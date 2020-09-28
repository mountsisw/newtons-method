import { ComplexNumber, EquationCollection } from "./NewtonsMethodClasses.js";
import { NewtonsMethodGallery, NewtonsMethodGalleryCloseup } from "./NewtonsMethodGallery.js";
let fsCanvas;
let galleries = new Map();
let viewer;
let firstImage;
window.onload = initNMApp();
function initNMApp() {
    fsCanvas = document.getElementById("fullScreenCanvas");
    fsCanvas.width = window.screen.width;
    fsCanvas.height = window.screen.height;
    document.documentElement.style.setProperty("--ratio", String(100 * fsCanvas.height / fsCanvas.width) + "%");
    document.getElementById("new").onclick = showMenu;
    document.getElementById("fractalMenu").onclick = startFractals;
    viewer = new NewtonsMethodGalleryCloseup();
}
function showMenu() {
    document.getElementById("imageViewer").style.display = "none";
    document.getElementById("fractalMenu").style.display = "block";
}
function startFractals() {
    firstImage = true;
    let equationNumbers = new Array();
    let equations = new EquationCollection();
    let collection = document.getElementById("collection");
    for (let nLoop = 1; nLoop <= equations.equationCount; nLoop++) {
        equationNumbers.push(nLoop);
        let equation = equations.getEquation(nLoop);
        galleries.set(nLoop, new NewtonsMethodGallery(collection, equation.HTML, viewer));
    }
    let worker = new Worker("NewtonsMethodWorker.js", { type: "module" });
    worker.onmessage = processMessage;
    worker.postMessage({ width: fsCanvas.width, height: fsCanvas.height, equations: equationNumbers });
}
function processMessage(event) {
    fsCanvas.getContext("2d").drawImage(event.data.imageBitmap, 0, 0);
    let planeData = new Array();
    for (let nLoop = 0; nLoop < event.data.plane.length; nLoop++)
        planeData.push(new ComplexNumber(event.data.plane[nLoop].r, event.data.plane[nLoop].i));
    let rootData = new Array();
    for (let nLoop = 0; nLoop < event.data.roots.length; nLoop++)
        rootData.push(new ComplexNumber(event.data.roots[nLoop].r, event.data.roots[nLoop].i));
    galleries.get(event.data.equationNumber).addImage(fsCanvas.toDataURL(), planeData, rootData, event.data.maxAttempts);
    if (firstImage) {
        galleries.get(event.data.equationNumber).showNewestImage();
        firstImage = false;
    }
}
