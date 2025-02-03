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
            console.log(socket.id);
            if (!response.ok)
                throw new Error(`Server returned an error: ${response.status}`);
            const body = await response.json();
            if (!body.gameId) throw new Error("No game id in response body");

            socket.on("gamestate", (payload) => {
                drawBoard(ctx, payload.board);
            });

            socket.emit("ready", { gameId: body.gameId });
        })
        .catch((error) =>
            console.error(`Error occured during request: ${error}`),
        );
});
