const gameGrid = document.querySelector("game-grid");
const dialog = document.querySelector("app-dialog");
const dialogReturn = document.querySelector("#dialog-return");
const dialogPlayAgain = document.querySelector("#dialog-play-again");

dialogReturn.addEventListener("click", () => {
    location.assign("/");
});

dialogPlayAgain.addEventListener("click", () => {
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

    socket.on("gamestate", (payload) => {
        if (gameId !== payload.gameId) return;

        const gameResult = payload.result;
        if (gameResult.type === "PLAYER_WIN") {
            if (gameResult.winner === 1) {
                dialog.setAttribute("content", "You lost!");
            } else {
                dialog.setAttribute("content", "You win!");
            }

            dialog.setAttribute("show", "yes");
        } else if (gameResult.type === "DRAW") {
            dialog.setAttribute("content", "It's a draw!");
            dialog.setAttribute("show", "yes");
        } else {
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
            const newMove = computeMove(mousePos.x, mousePos.y);
            socket.emit("move", {
                gameId,
                direction: newMove,
            });
            lastMove = newMove;
        }
    });

    document.addEventListener("mousemove", (event) => {
        if (!gameGrid.somePlayerPos) return;

        mousePos = { x: event.clientX, y: event.clientY };
        const newMove = computeMove(event.clientX, event.clientY);

        let playerPos = gameGrid.getAttribute("playerpos");

        if (playerPos) {
            playerPos = JSON.parse(playerPos);

            const nextMousePos = moveInDirection(
                { x: playerPos.column, y: playerPos.row },
                newMove,
            );

            gameGrid.setAttribute("nextmousepos", JSON.stringify(nextMousePos));
        }

        if (newMove !== lastMove) {
            socket.emit("move", {
                gameId,
                direction: newMove,
            });
            lastMove = newMove;
        }
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

function findPlayerPos(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === -2) return { x: j, y: i };
        }
    }
}
