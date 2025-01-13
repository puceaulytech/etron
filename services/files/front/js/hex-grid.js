let canvas = document.getElementById("hexmap");
canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;

let hexHeight,
    hexRadius,
    hexRectangleHeight,
    hexRectangleWidth,
    hexagonAngle = 0.523598776, // 30 degrees in radians
    boardWidth = 16,
    boardHeight = 9,
    // S = W / 2 * num hex * f
    // we substract 40 to the width to have a little bit of margin
    sideLength = (canvas.width - 40) / (2 * 0.866 * boardWidth),
    offset = 5;

hexHeight = Math.sin(hexagonAngle) * sideLength;
hexRadius = Math.cos(hexagonAngle) * sideLength;
hexRectangleHeight = sideLength + 2 * hexHeight;
hexRectangleWidth = 2 * hexRadius;
let ctx = canvas.getContext('2d');

ctx.fillStyle = "#000000";
ctx.strokeStyle = "#000000";
ctx.lineWidth = 3;

drawBoard(ctx, boardWidth, boardHeight);

function drawBoard(canvasContext, width, height) {
    for (let i = 0; i < height; i++) {
        let hexagons = (i % 2 === 0) ? width : width - 1; // N for even rows, N-1 for odd rows
        let xStart = (i % 2 === 0) ? 0 : hexRadius; // Shift odd rows by half a hexagon's width

        for (let j = 0; j < hexagons; j++) {
            drawHexagon(
                canvasContext,
                j * hexRectangleWidth + xStart + offset,
                i * (sideLength + hexHeight) + offset,
                false
            );
        }
    }
}

function drawHexagon(canvasContext, x, y, doFill) {
    const fill = doFill || false;

    canvasContext.beginPath();
    canvasContext.moveTo(x + hexRadius, y);
    canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
    canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
    canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
    canvasContext.lineTo(x, y + sideLength + hexHeight);
    canvasContext.lineTo(x, y + hexHeight);
    canvasContext.closePath();

    if (fill)
        canvasContext.fill();
    else
        canvasContext.stroke();
}
