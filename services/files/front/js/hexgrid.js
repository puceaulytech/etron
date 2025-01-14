const canvas = document.getElementById("hexmap");
canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;

const hexagonAngle = 0.523598776, // 30 degrees in radians
    boardWidth = 16,
    boardHeight = 9,
    // S = W / 2 * num hex * f
    // we substract 40 to the width to have a little bit of margin
    sideLength = (canvas.width - 40) / (2 * 0.866 * boardWidth),
    offset = 5,
    hexHeight = Math.sin(hexagonAngle) * sideLength,
    hexRadius = Math.cos(hexagonAngle) * sideLength,
    hexRectangleHeight = sideLength + 2 * hexHeight,
    hexRectangleWidth = 2 * hexRadius;

/**
 * @param {CanvasRenderingContext2D} canvasContext
 * @param {Array<Array>} board
 */
function drawBoard(canvasContext, board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let filling;
            switch (board[i][j]) {
                case 1:
                    filling = "#0362fc";
                    break;
                case 2:
                    filling = "#f59c0c";
                    break;
                case 11:
                    filling = "#062659";
                    break;
                case 12:
                    filling = "#965e03";
                    break;
                default:
                    filling = null;
            }
            drawHexagon(canvasContext, j, i, filling);
        }
    }
}

/**
 * @param {CanvasRenderingContext2D} canvasContext
 * @param {number} x
 * @param {number} y
 * @param {boolean} doFill
 */
function drawHexagon(canvasContext, x, y, filling) {
    const xStart = y % 2 === 0 ? 0 : hexRadius;
    x = x * hexRectangleWidth + xStart + offset;
    y = y * (sideLength + hexHeight) + offset;

    canvasContext.beginPath();
    canvasContext.moveTo(x + hexRadius, y);
    canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
    canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
    canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
    canvasContext.lineTo(x, y + sideLength + hexHeight);
    canvasContext.lineTo(x, y + hexHeight);
    canvasContext.closePath();

    if (filling) {
        canvasContext.fillStyle = filling;
        canvasContext.fill();
    }
    canvasContext.stroke();
}
