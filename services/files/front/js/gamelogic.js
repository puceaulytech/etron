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

let playerOneMove = { x: 0, y: 0 };

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "q":
            playerOneMove = { x: -1, y: 0 };
            break;
        case "d":
            playerOneMove = { x: 1, y: 0 };
            break;
        case "w":
            playerOneMove = {
                x: playerOne.position().y % 2 === 0 ? -1 : 0,
                y: 1,
            };
            break;
        case "x":
            playerOneMove = {
                x: playerOne.position().y % 2 === 0 ? 0 : 1,
                y: 1,
            };
            break;
        case "z":
            playerOneMove = {
                x: playerOne.position().y % 2 === 0 ? -1 : 0,
                y: -1,
            };
            break;
        case "e":
            playerOneMove = {
                x: playerOne.position().y % 2 === 0 ? 0 : 1,
                y: -1,
            };
            break;
        default:
            return;
    }
});

const intervalId = setInterval(() => {
    console.log("Playing turn...");
    playerOne.move(board, playerOneMove);
    drawBoard(ctx, board);

    if (gameDone(board)) {
        clearInterval(intervalId);
        console.log("Game over!");
    }

    playerOneMove = { x: 0, y: 0 };
}, 500);
