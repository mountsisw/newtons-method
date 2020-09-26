// @ts-check

onmessage = function(event)
{
    let canvas = new OffscreenCanvas(event.data.width, event.data.height);
    let ctx = canvas.getContext("2d");
    ctx.font = "bold " + String(Math.floor(Math.min(event.data.width, event.data.height) * 0.8)) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "white";
    let maxAttempts = 2;
    for (let nLoop = 1; nLoop <= 5; nLoop++)
    {
        maxAttempts *= 2;
        ctx.clearRect(0, 0, event.data.width, event.data.height);
        for (let xLoop = 0; xLoop < canvas.width; xLoop++)
            for (let yLoop = 0; yLoop < canvas.height; yLoop++)
            {
                if (xLoop % 2 && yLoop % 2) ctx.fillStyle = "red";
                else if (xLoop % 2) ctx.fillStyle = "green";
                else if (yLoop % 2) ctx.fillStyle = "blue";
                else ctx.fillStyle = "black";
                ctx.fillRect(xLoop, yLoop, 1, 1);
            }
        ctx.strokeText(String(nLoop), event.data.width / 2, event.data.height / 2);
        let imageBitmap = canvas.transferToImageBitmap();
        postMessage({imageBitmap: imageBitmap,
            roots: [{r: 1, i: 0}, {r: -0.5, i: Math.sqrt(3) / 2}, {r: -0.5, i: Math.sqrt(3) / -2},
            {r: 1, i: 0}, {r: -0.5, i: Math.sqrt(3) / 2}, {r: -0.5, i: Math.sqrt(3) / -2},
            {r: 1, i: 0}, {r: -0.5, i: Math.sqrt(3) / 2}, {r: -0.5, i: Math.sqrt(3) / -2},
            {r: 1, i: 0}, {r: -0.5, i: Math.sqrt(3) / 2}, {r: -0.5, i: Math.sqrt(3) / -2}],
            plane: [{r: -2.4, i: 1.5}, {r: 2.4, i: -1.5}],
            maxAttempts: maxAttempts}, [imageBitmap]);
    }
}