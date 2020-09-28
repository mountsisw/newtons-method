import { ComplexNumber } from "./NewtonsMethodClasses.js";

onmessage = function(event)
{
    let canvas: OffscreenCanvas = new OffscreenCanvas(event.data.width, event.data.height);
    let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    ctx.font = "bold " + String(Math.floor(Math.min(event.data.width, event.data.height) * 0.8)) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "white";
    for (let nLoop = 1; nLoop <= event.data.equations.length; nLoop++)
    {
        let maxAttempts: number = 2;
        for (let nAttemptLoop: number = 1; nAttemptLoop <= 5; nAttemptLoop++)
        {
            maxAttempts *= 2;
            ctx.clearRect(0, 0, event.data.width, event.data.height);
            for (let xLoop: number = 0; xLoop < canvas.width; xLoop++)
                for (let yLoop: number = 0; yLoop < canvas.height; yLoop++)
                {
                    if (xLoop % 2 && yLoop % 2) ctx.fillStyle = "red";
                    else if (xLoop % 2) ctx.fillStyle = "green";
                    else if (yLoop % 2) ctx.fillStyle = "blue";
                    else ctx.fillStyle = "black";
                    ctx.fillRect(xLoop, yLoop, 1, 1);
                }
            ctx.strokeText(String(nAttemptLoop), event.data.width / 2, event.data.height / 2);
            let imageBitmap: ImageBitmap = canvas.transferToImageBitmap();
            postMessage({imageBitmap: imageBitmap,
                plane: [new ComplexNumber(-2.4, 1.5), new ComplexNumber(2.4, -1.5)],
                roots: [new ComplexNumber(1, 0), new ComplexNumber(-0.5, Math.sqrt(3) / 2), new ComplexNumber(-0.5, Math.sqrt(3) / -2),
                new ComplexNumber(1, 0), new ComplexNumber(-0.5, Math.sqrt(3) / 2), new ComplexNumber(-0.5, Math.sqrt(3) / -2),
                new ComplexNumber(1, 0), new ComplexNumber(-0.5, Math.sqrt(3) / 2), new ComplexNumber(-0.5, Math.sqrt(3) / -2),
                new ComplexNumber(1, 0), new ComplexNumber(-0.5, Math.sqrt(3) / 2), new ComplexNumber(-0.5, Math.sqrt(3) / -2)],
                maxAttempts: maxAttempts, equationNumber: nLoop}, [imageBitmap]);
        }
    }
}