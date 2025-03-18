const gameGrid = document.querySelector("game-grid");
const waitingForOpponent = document.querySelector("#waiting-for-opponent");

waitingForOpponent.style.visibility = "visible";

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

        waitingForOpponent.style.visibility = "hidden";

        gameGrid.setAttribute("grid", JSON.stringify(payload.board));
    });

    document.addEventListener("keydown", (event) => {
        switch (event.key.toLowerCase()) {
            /* Player 1 keys */
            case "q":
                socket.emit("move", {
                    gameId,
                    direction: "LEFT",
                });
                break;
            case "d":
                socket.emit("move", {
                    gameId,
                    direction: "RIGHT",
                });
                break;
            case "w":
                socket.emit("move", {
                    gameId,
                    direction: "BOTTOM_LEFT",
                });
                break;
            case "x":
                socket.emit("move", {
                    gameId,
                    direction: "BOTTOM_RIGHT",
                });
                break;
            case "z":
                socket.emit("move", {
                    gameId,
                    direction: "TOP_LEFT",
                });
                break;
            case "e":
                socket.emit("move", {
                    gameId,
                    direction: "TOP_RIGHT",
                });
                break;
        }
    });
});
