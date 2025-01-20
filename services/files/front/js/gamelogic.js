const ctx = canvas.getContext("2d");

ctx.fillStyle = "#000000";
ctx.strokeStyle = "#000000";
ctx.lineWidth = 3;

const board = new Array(boardHeight);

for (let i = 0; i < boardHeight; i++)
    board[i] = new Array(i % 2 === 0 ? boardWidth : boardWidth - 1).fill(0);

const startingPosition = Math.floor(Math.random() * boardHeight);
const playerOne = new Player(1, 0, startingPosition);
const playerTwo = new Player(
    2,
    boardWidth - 1,
    boardHeight - startingPosition - 1,
);

playerOne.placeInBoard(board);
playerTwo.placeInBoard(board);
drawBoard(ctx, board);

let playerOneMove = null;

document.addEventListener("keydown", (event) => {
    switch (event.key.toLowerCase()) {
        case "q":
            playerOneMove = "LEFT";
            break;
        case "d":
            playerOneMove = "RIGHT";
            break;
        case "w":
            playerOneMove = "BOTTOM_LEFT";
            break;
        case "x":
            playerOneMove = "BOTTOM_RIGHT";
            break;
        case "z":
            playerOneMove = "TOP_LEFT";
            break;
        case "e":
            playerOneMove = "TOP_RIGHT";
            break;
        default:
            return;
    }
});

const intervalId = setInterval(() => {
    console.log("Playing turn...");
    if (playerOneMove) playerOne.move(board, playerOneMove);
    drawBoard(ctx, board);

    if (gameDone(board)) {
        clearInterval(intervalId);
        alert("Game over!");
    }

    playerOneMove = null;
}, 500);
