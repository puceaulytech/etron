const gameGrid = document.querySelector("game-grid");
const endReturn = document.querySelector("#end-return");
const endPlayAgain = document.querySelector("#end-play-again");
const countdown = document.querySelector("#countdown");

countdown.style.visibility = "visible";

endReturn.addEventListener("click", () => {
    location.assign("/");
});

endPlayAgain.addEventListener("click", () => {
    location.reload();
});

const board = new Array(BOARD_HEIGHT);

for (let i = 0; i < BOARD_HEIGHT; i++)
    board[i] = new Array(i % 2 === 0 ? BOARD_WIDTH : BOARD_WIDTH - 1).fill(0);

const startingPosition = Math.floor(Math.random() * BOARD_HEIGHT);
const playerOne = new Player(-2, 0, startingPosition);
const playerTwoY = BOARD_HEIGHT - startingPosition - 1;
const playerTwo = new Player(2, board[playerTwoY].length - 1, playerTwoY);

let intervalId;

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

function startLocalGame() {
    intervalId = setInterval(() => {
        if (playerOneMove) playerOne.move(board, playerOneMove);
        if (playerTwoMove) playerTwo.move(board, playerTwoMove);
        gameGrid.setAttribute("grid", JSON.stringify(board));

        const winner = getWinner(board);

        if (winner) {
            clearInterval(intervalId);

            let playerName;
            if (winner === -2) {
                playerName = "1";
            } else {
                playerName = "2";
            }
        }
    }, 500);
}

setTimeout(() => {
    countdown.querySelector(".title").textContent = "2";

    setTimeout(() => {
        countdown.querySelector(".title").textContent = "1";

        setTimeout(() => {
            countdown.style.visibility = "hidden";
            document
                .querySelector("#left-keyboard-controls")
                .classList.add("visible");
            document
                .querySelector("#right-keyboard-controls")
                .classList.add("visible");
            document.querySelector(".game-hud").classList.add("visible");

            startLocalGame();
        }, 1000);
    }, 1000);
}, 1000);
