const gameGrid = document.querySelector("game-grid");
const endReturn = document.querySelector("#end-return");
const endPlayAgain = document.querySelector("#end-play-again");
const countdown = document.querySelector("#countdown");
const roundsBar = document.querySelector("rounds-bar");

countdown.style.visibility = "visible";

endReturn.addEventListener("click", () => {
    location.assign("/");
});

endPlayAgain.addEventListener("click", () => {
    location.reload();
});

let board;

let startingPosition;
let playerOne;
let playerTwoY;
let playerTwo;

let playerOneRounds = 0;
let playerTwoRounds = 0;

let intervalId;

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

function resetGame() {
    board = new Array(BOARD_HEIGHT);

    for (let i = 0; i < BOARD_HEIGHT; i++)
        board[i] = new Array(i % 2 === 0 ? BOARD_WIDTH : BOARD_WIDTH - 1).fill(
            0,
        );

    startingPosition = Math.floor(Math.random() * BOARD_HEIGHT);
    playerOne = new Player(-2, 0, startingPosition);
    playerTwoY = BOARD_HEIGHT - startingPosition - 1;
    playerTwo = new Player(2, board[playerTwoY].length - 1, playerTwoY);

    playerOne.placeInBoard(board);
    playerTwo.placeInBoard(board);

    playerOneMove = "RIGHT";
    playerTwoMove = "LEFT";
}

function runLoop() {
    if (playerOneMove) playerOne.move(board, playerOneMove);
    if (playerTwoMove) playerTwo.move(board, playerTwoMove);
    gameGrid.setAttribute("grid", JSON.stringify(board));

    const winner = getWinner(board);

    if (winner) {
        clearInterval(intervalId);

        let playerName;
        if (winner === -2) {
            playerOneRounds++;
            // First player
            playerName = "1";
        } else {
            playerTwoRounds++;
            // Second player
            playerName = "2";
        }

        roundsBar.setAttribute("left-rounds", playerOneRounds);
        roundsBar.setAttribute("right-rounds", playerTwoRounds);

        if (playerOneRounds === 3 || playerTwoRounds === 3) {
            countdown.style.visibility = "visible";
            countdown.querySelector(".title").textContent =
                `Player ${playerName} won!`;
            countdown.querySelector(".subtitle").textContent = "";
            countdown.querySelector(".blur-overlay-buttons").style.visibility =
                "visible";
        } else {
            countdown.style.visibility = "visible";
            countdown.querySelector(".title").textContent = "";
            countdown.querySelector(".subtitle").textContent =
                `- Round won by Player ${playerName} -`;

            resetGame();
            startCountdown();
        }
    }
}

function startCountdown() {
    countdown.querySelector(".title").textContent = "3";

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
                roundsBar.classList.add("visible");

                runLoop();
                intervalId = setInterval(() => {
                    runLoop();
                }, 500);
            }, 1000);
        }, 1000);
    }, 1000);
}

resetGame();
startCountdown();
