const gameGrid = document.querySelector("game-grid");
const endReturn = document.querySelector("#end-return");
const endPlayAgain = document.querySelector("#end-play-again");
const loadingScreen = document.querySelector("#loading-screen");
const roundsBar = document.querySelector("rounds-bar");
const countdownDiv = document.querySelector("#countdown");

endReturn.addEventListener("click", () => {
    location.assign("/");
});

endPlayAgain.addEventListener("click", () => {
    location.reload();
});

const directions = [
    "RIGHT",
    "TOP_RIGHT",
    "TOP_LEFT",
    "LEFT",
    "BOTTOM_LEFT",
    "BOTTOM_RIGHT",
];

let lastMove;
let mousePos;

socket.on("connect", async () => {
    const ongoingGamesResp = await authenticatedFetch(
        "/api/gamesvc/ongoinggames?gameMode=ai",
    );

    let gameId = ongoingGamesResp.ongoingGameId;

    if (!ongoingGamesResp.ongoingGameId) {
        const body = await authenticatedFetch("/api/gamesvc/playagainstai", {
            method: "POST",
        });

        if (!body.gameId) throw new Error("No game id in response body");

        socket.emit("ready", { gameId: body.gameId });

        gameId = body.gameId;
    }

    socket.on("countdown", (payload) => {
        if (gameId !== payload.gameId) return;

        loadingScreen.classList.remove("visible");

        countdownDiv.style.visibility = "visible";
        countdownDiv.querySelector("p.title").textContent =
            payload.delay.toString();
    });

    socket.on("gamestate", (payload) => {
        if (gameId !== payload.gameId) return;

        document.querySelector(".controls-container").classList.add("visible");
        document.querySelector(".game-hud").classList.add("visible");
        document.querySelector("rounds-bar").classList.add("visible");

        countdownDiv.style.visibility = "hidden";

        loadingScreen.classList.remove("visible");

        roundsBar.setAttribute("left-rounds", payload.playerRoundWon);
        roundsBar.setAttribute("right-rounds", payload.aiRoundWon);

        if (payload.playerRoundWon === 3 || payload.aiRoundWon === 3) {
            countdownDiv.querySelector("p.subtitle").textContent = "";

            if (payload.aiRoundWon === 3) {
                countdownDiv.querySelector("p.title").textContent = "You lost!";
            } else {
                countdownDiv.querySelector("p.title").textContent = "You won!";
            }

            countdownDiv.style.visibility = "visible";
            countdownDiv.querySelector(
                ".blur-overlay-buttons",
            ).style.visibility = "visible";
        } else if (payload.result.type === "DRAW") {
            countdownDiv.querySelector("p.subtitle").textContent =
                "- It's a draw! -";
        } else if (payload.result.type === "PLAYER_WIN") {
            countdownDiv.querySelector("p.subtitle").textContent =
                payload.result.winner === 1
                    ? "- Round lost -"
                    : "- Round won -";
        } else if (payload.result.type === "UNFINISHED") {
            const playerPos = findPlayerPos(payload.board);
            gameGrid.setAttribute(
                "playerpos",
                JSON.stringify({
                    column: playerPos.x,
                    row: playerPos.y,
                }),
            );
            gameGrid.setAttribute("grid", JSON.stringify(payload.board));

            if (!mousePos) return;
            const newMove = computeMove(mousePos.x, mousePos.y, true);
            socket.emit("move", {
                gameId,
                direction: newMove,
            });
            lastMove = newMove;

            updateNextMousePos(newMove);

            // Randomly taunt player
            if (Math.random() < 0.1) {
                const index = Math.floor(Math.random() * emotes.length);
                displayEmote(emotes[index], true);
            }
        }
    });

    document.addEventListener("mousemove", (event) => {
        if (!gameGrid.somePlayerPos) return;

        mousePos = { x: event.clientX, y: event.clientY };
        const newMove = computeMove(event.clientX, event.clientY, true);

        updateNextMousePos(newMove);

        if (newMove !== lastMove) {
            socket.emit("move", {
                gameId,
                direction: newMove,
            });
            lastMove = newMove;
        }
    });
});

function findPlayerPos(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === -2) return { x: j, y: i };
        }
    }
}
