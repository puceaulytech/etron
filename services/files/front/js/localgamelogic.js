const gameGrid = document.querySelector("game-grid");

console.log(gameGrid);

const board = new Array(BOARD_HEIGHT);

for (let i = 0; i < BOARD_HEIGHT; i++)
    board[i] = new Array(i % 2 === 0 ? BOARD_WIDTH : BOARD_WIDTH - 1).fill(0);

const startingPosition = Math.floor(Math.random() * BOARD_HEIGHT);
const playerOne = new Player(-2, 0, startingPosition);
const playerTwo = new Player(
    2,
    BOARD_WIDTH - 1,
    BOARD_HEIGHT - startingPosition - 1,
);

playerOne.placeInBoard(board);
playerTwo.placeInBoard(board);
// FIXME: this makes the canvas bug but commenting this will delay showing the game grid
// gameGrid.setAttribute("grid", JSON.stringify(board));

let playerOneMove = "RIGHT";
let playerTwoMove = "LEFT";

document.addEventListener("keydown", (event) => {
    switch (event.key.toLowerCase()) {
        /* Player 1 keys */
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
        /* Player 2 keys */
        case "k":
            playerTwoMove = "LEFT";
            break;
        case "m":
            playerTwoMove = "RIGHT";
            break;
        case ";":
            playerTwoMove = "BOTTOM_LEFT";
            break;
        case ":":
            playerTwoMove = "BOTTOM_RIGHT";
            break;
        case "o":
            playerTwoMove = "TOP_LEFT";
            break;
        case "p":
            playerTwoMove = "TOP_RIGHT";
            break;
    }
});

const intervalId = setInterval(() => {
    console.log("Playing turn...");
    if (playerOneMove) playerOne.move(board, playerOneMove);
    if (playerTwoMove) playerTwo.move(board, playerTwoMove);
    gameGrid.setAttribute("grid", JSON.stringify(board));

    if (gameDone(board)) {
        clearInterval(intervalId);
        alert("Game over!");
    }
}, 500);
