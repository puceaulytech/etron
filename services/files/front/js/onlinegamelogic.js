const gameGrid = document.querySelector("game-grid");
const waitingForOpponent = document.querySelector("#waiting-for-opponent");
const countdownDiv = document.querySelector("#countdown");
const endReturn = document.querySelector("#end-return");
const endPlayAgain = document.querySelector("#end-play-again");
const roundsBar = document.querySelector("rounds-bar");

const myUserId = localStorage.getItem("userId");

let opponentId;
let opponentInfo;

let inverted = false;

let lastMove;
let mousePos;
let gameId;

waitingForOpponent.style.visibility = "visible";

endReturn.addEventListener("click", () => {
    location.assign("/");
});

endPlayAgain.addEventListener("click", () => {
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

        waitingForOpponent.style.visibility = "hidden";

        countdownDiv.style.visibility = "visible";
        countdownDiv.querySelector("p.title").textContent =
            payload.delay.toString();
    });

    socket.on("gamestate", (payload) => {
        if (gameId !== payload.gameId) return;

        const side = payload.sides[myUserId];

        inverted = side === "right";

        waitingForOpponent.style.visibility = "hidden";
        countdownDiv.style.visibility = "hidden";

        const gameResult = payload.result;
        const myRounds = payload.rounds[myUserId];
        const opponentRounds = payload.rounds[opponentId];

        roundsBar.setAttribute("left-rounds", myRounds);
        roundsBar.setAttribute("right-rounds", opponentRounds);

        if (myRounds === 3 || opponentRounds === 3) {
            countdownDiv.querySelector("p.subtitle").textContent = "";

            if (myRounds === 3) {
                countdownDiv.querySelector("p.title").textContent = "You won!";
            } else {
                countdownDiv.querySelector("p.title").textContent = "You lost!";
            }

            countdownDiv.style.visibility = "visible";
            countdownDiv.querySelector(
                ".blur-overlay-buttons",
            ).style.visibility = "visible";
        } else if (gameResult.type === "DRAW") {
            countdownDiv.querySelector("p.subtitle").textContent =
                "- It's a draw! -";
        } else if (gameResult.type === "PLAYER_WIN") {
            const own = inverted ? 1 : -1;

            countdownDiv.querySelector("p.subtitle").textContent =
                payload.result.winner === own
                    ? "- Round lost -"
                    : "- Round won -";
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
                        document
                            .querySelector("rounds-bar")
                            .classList.add("visible");
                        document
                            .querySelector("#emote-container")
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
});
