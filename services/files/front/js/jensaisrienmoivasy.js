const ctx = canvas.getContext("2d");

ctx.fillStyle = "#000000";
ctx.strokeStyle = "#000000";
ctx.lineWidth = 3;

socket.on("connect", () => {
    fetch("/api/gamesvc/playagainstai", {
        method: "POST",
        body: JSON.stringify({ clientId: socket.id }),
    })
        .then(async (response) => {
            if (!response.ok)
                throw new Error(`Server returned an error: ${response.status}`);
            const body = await response.json();
            if (!body.gameId) throw new Error("No game id in response body");

            socket.on("gamestate", (payload) => {
                drawBoard(ctx, payload.board);
            });

            socket.emit("ready", { gameId: body.gameId });
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
        })
        .catch((error) =>
            console.error(`Error occured during request: ${error}`),
        );
});
