const gameGrid = document.querySelector("game-grid");
const waitingForOpponent = document.querySelector("#waiting-for-opponent");
const dialog = document.querySelector("app-dialog");
const dialogReturn = document.querySelector("#dialog-return");
const dialogPlayAgain = document.querySelector("#dialog-play-again");

const myUserId = localStorage.getItem("userId");

let inverted = false;

waitingForOpponent.style.visibility = "visible";

dialogReturn.addEventListener("click", () => {
    location.assign("/");
});

dialogPlayAgain.addEventListener("click", () => {
    location.reload();
});

socket.on("connect", async () => {
    const ongoingGamesResp = await authenticatedFetch(
        "/api/gamesvc/ongoinggames?gameMode=online",
    );

    let gameId = ongoingGamesResp.ongoingGameId;

    if (ongoingGamesResp.ongoingGameId === null) {
        const body = await authenticatedFetch("/api/gamesvc/play", {
            method: "POST",
        });

        if (!body.gameId) throw new Error("No game id in response body");

        socket.emit("ready", { gameId: body.gameId });

        gameId = body.gameId;
    }

    socket.on("gamestate", (payload) => {
        if (gameId !== payload.gameId) return;

        const side = payload.sides[myUserId];

        inverted = side === "right";

        waitingForOpponent.style.visibility = "hidden";

        const gameResult = payload.result;

        if (gameResult.type === "PLAYER_WIN") {
            const myNb = side === "left" ? 1 : -1;

            if (gameResult.winner === myNb) {
                dialog.setAttribute("content", "You win!");
            } else {
                dialog.setAttribute("content", "You lost!");
            }

            dialog.setAttribute("show", "yes");
        } else if (gameResult.type === "DRAW") {
            dialog.setAttribute("content", "It's a draw!");
            dialog.setAttribute("show", "yes");
        } else {
            if (inverted) {
                gameGrid.setAttribute("inverted", "yes");
            } else {
                gameGrid.removeAttribute("inverted");
            }

            gameGrid.setAttribute("grid", JSON.stringify(payload.board));
        }
    });

    document.addEventListener("keydown", (event) => {
        switch (event.key.toLowerCase()) {
            /* Player 1 keys */
            case "q":
                socket.emit("move", {
                    gameId,
                    direction: inverted ? "RIGHT" : "LEFT",
                });
                break;
            case "d":
                socket.emit("move", {
                    gameId,
                    direction: inverted ? "LEFT" : "RIGHT",
                });
                break;
            case "w":
                socket.emit("move", {
                    gameId,
                    direction: inverted ? "BOTTOM_RIGHT" : "BOTTOM_LEFT",
                });
                break;
            case "x":
                socket.emit("move", {
                    gameId,
                    direction: inverted ? "BOTTOM_LEFT" : "BOTTOM_RIGHT",
                });
                break;
            case "z":
                socket.emit("move", {
                    gameId,
                    direction: inverted ? "TOP_RIGHT" : "TOP_LEFT",
                });
                break;
            case "e":
                socket.emit("move", {
                    gameId,
                    direction: inverted ? "TOP_LEFT" : "TOP_RIGHT",
                });
                break;
        }
    });
});
