const gameGrid = document.querySelector("game-grid");
const waitingForOpponent = document.querySelector("#waiting-for-opponent");
const dialog = document.querySelector("app-dialog");
const dialogReturn = document.querySelector("#dialog-return");
const dialogPlayAgain = document.querySelector("#dialog-play-again");
const roundsBar = document.querySelector("rounds-bar");

const myUserId = localStorage.getItem("userId");

let opponentId;
let opponentInfo;

let inverted = false;

let lastMove;
let mousePos;
let gameId;

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

    gameId = ongoingGamesResp.ongoingGameId;

    if (ongoingGamesResp.ongoingGameId === null) {
        const body = await authenticatedFetch("/api/gamesvc/play", {
            method: "POST",
        });

        if (!body.gameId) throw new Error("No game id in response body");

        socket.emit("ready", { gameId: body.gameId });

        gameId = body.gameId;
    }

    if (ongoingGamesResp.notReady) {
        socket.emit("ready", { gameId });
    }

    socket.on("countdown", (payload) => {
        if (gameId !== payload.gameId) return;

        waitingForOpponent.style.visibility = "visible";
        waitingForOpponent.querySelector("p").textContent =
            payload.delay.toString();
    });

    socket.on("gamestate", (payload) => {
        if (gameId !== payload.gameId) return;

        const side = payload.sides[myUserId];

        inverted = side === "right";

        waitingForOpponent.style.visibility = "hidden";

        const gameResult = payload.result;
        const myRounds = payload.rounds[myUserId];
        const opponentRounds = payload.rounds[opponentId];

        roundsBar.setAttribute("left-rounds", myRounds);
        roundsBar.setAttribute("right-rounds", opponentRounds);

        if (myRounds === 3 || opponentRounds === 3) {
            if (myRounds === 3) {
                dialog.setAttribute("content", "You won!");
            } else {
                dialog.setAttribute("content", "You lost!");
            }

            dialog.setAttribute("show", "yes");
        } else if (gameResult.type === "UNFINISHED") {
            if (inverted) {
                gameGrid.setAttribute("inverted", "yes");
            } else {
                gameGrid.removeAttribute("inverted");
            }

            const myPos = payload.positions[myUserId];
            gameGrid.setAttribute("playerpos", JSON.stringify(myPos));
            gameGrid.setAttribute("grid", JSON.stringify(payload.board));

            if (!mousePos || !gameGrid.somePlayerPos) return; // I don't know if this is necessary

            const newMove = computeMove(mousePos.x, mousePos.y, inverted);
            socket.emit("move", {
                gameId,
                direction: newMove,
            });
            lastMove = newMove;

            updateNextMousePos(newMove);

            if (!opponentInfo) {
                opponentId = Object.keys(payload.sides).find(
                    (id) => id !== myUserId,
                );

                authenticatedFetch(`/api/social/users/${opponentId}`).then(
                    (userInfo) => {
                        if (!userInfo) return;

                        document.title = `eTron - Playing against ${userInfo.username}`;
                        document.querySelector(
                            ".game-hud .opponent-name",
                        ).textContent = userInfo.username;
                        document
                            .querySelector(".game-hud")
                            .classList.add("visible");

                        opponentInfo = userInfo;
                    },
                );
            }
        }
    });

    document.addEventListener("mousemove", (event) => {
        mousePos = { x: event.clientX, y: event.clientY };
        if (!gameGrid.somePlayerPos) return;

        const newMove = computeMove(event.clientX, event.clientY, inverted);

        updateNextMousePos(newMove);

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
