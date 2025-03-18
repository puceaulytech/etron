const gameGrid = document.querySelector("game-grid");

const directions = [
    "RIGHT",
    "TOP_RIGHT",
    "TOP_LEFT",
    "LEFT",
    "BOTTOM_LEFT",
    "BOTTOM_RIGHT",
];

let lastMove;

socket.on("connect", async () => {
    const ongoingGamesResp = await authenticatedFetch(
        "/api/gamesvc/ongoinggames",
    );

    socket.on("gamestate", (payload) => {
        console.log(payload.result);
        gameGrid.setAttribute("grid", JSON.stringify(payload.board));
        // drawBoard(ctx, payload.board);
    });

    let gameId = ongoingGamesResp.ongoingGameId;

    if (!ongoingGamesResp.ongoingGameId) {
        const body = await authenticatedFetch("/api/gamesvc/playagainstai", {
            method: "POST",
        });

        if (!body.gameId) throw new Error("No game id in response body");

        socket.emit("ready", { gameId: body.gameId });

        gameId = body.gameId;

        document.addEventListener("mousemove", (event) => {
            if (!gameGrid.somePlayerPos) return;

            const vector = {
                x:
                    -event.clientX +
                    gameGrid.somePlayerPos.x +
                    gameGrid.absoluteOffset.x,
                y:
                    -event.clientY +
                    gameGrid.somePlayerPos.y +
                    gameGrid.absoluteOffset.y,
            };

            let radians = Math.atan2(vector.y, vector.x);
            let degrees = radians * (180 / Math.PI);

            const newMove = getHexDirection(degrees + 180);

            if (newMove !== lastMove) {
                socket.emit("move", {
                    gameId,
                    direction: newMove,
                });
                lastMove = newMove;
            }
        });
    }

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

function findPlayerPos(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === -2) return { x: j, y: i };
        }
    }
}

function getHexDirection(angle) {
    if (angle >= 330 || angle < 30) return "RIGHT";
    if (angle >= 30 && angle < 90) return "BOTTOM_RIGHT";
    if (angle >= 90 && angle < 150) return "BOTTOM_LEFT";
    if (angle >= 150 && angle < 210) return "LEFT";
    if (angle >= 210 && angle < 270) return "TOP_LEFT";
    if (angle >= 270 && angle < 330) return "TOP_RIGHT";
}
