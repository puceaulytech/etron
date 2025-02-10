const ctx = canvas.getContext("2d");

ctx.fillStyle = "#000000";
ctx.strokeStyle = "#000000";
ctx.lineWidth = 3;

socket.on("connect", async () => {
    const ongoingGamesResp = await authenticatedFetch(
        "/api/gamesvc/ongoinggames",
    );

    socket.on("gamestate", (payload) => {
        console.log(payload.result);
        drawBoard(ctx, payload.board);
    });

    if (ongoingGamesResp.ongoingGameId === null) {
        const body = await authenticatedFetch("/api/gamesvc/playagainstai", {
            method: "POST",
        });

        if (!body.gameId) throw new Error("No game id in response body");

        socket.emit("ready", { gameId: body.gameId });
    }

    document.addEventListener("keydown", (event) => {
        switch (event.key.toLowerCase()) {
            /* Player 1 keys */
            case "q":
                socket.emit("move", {
                    gameId: body.gameId,
                    direction: "LEFT",
                });
                break;
            case "d":
                socket.emit("move", {
                    gameId: body.gameId,
                    direction: "RIGHT",
                });
                break;
            case "w":
                socket.emit("move", {
                    gameId: body.gameId,
                    direction: "BOTTOM_LEFT",
                });
                break;
            case "x":
                socket.emit("move", {
                    gameId: body.gameId,
                    direction: "BOTTOM_RIGHT",
                });
                break;
            case "z":
                socket.emit("move", {
                    gameId: body.gameId,
                    direction: "TOP_LEFT",
                });
                break;
            case "e":
                socket.emit("move", {
                    gameId: body.gameId,
                    direction: "TOP_RIGHT",
                });
                break;
        }
    });
});
