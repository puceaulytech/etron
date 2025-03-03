const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const storage = require("./storage");
const { Direction, GameState, OPPONENT } = require("../helpers/gameutils");
const { verifyAccessToken } = require("../helpers/tokens");

function handleWS(httpServer) {
    const io = new Server(httpServer, {});

    io.use((socket, next) => {
        const accessToken = socket.handshake.auth.accessToken;

        if (!accessToken) return next(new Error("Authentification error"));

        try {
            const decoded = verifyAccessToken(jwt, accessToken);
            socket.userId = decoded._id;
            storage.addClient(socket.userId, socket.id);
        } catch (err) {
            return next(new Error("Invalid token"));
        }

        next();
    });

    io.on("connection", (socket) => {
        socket.on("ready", (payload) => {
            // TODO: check payload coming from client
            const game = storage.games.get(payload.gameId);

            if (!game) return;

            if (game.ai) {
                game.ready = true;
            } else {
                if (game.firstPlayer === socket.userId) {
                    game.firstReady = true;
                } else if (game.secondPlayer === socket.userId) {
                    game.secondReady = true;
                }

                socket.join(game.id);
            }
        });

        socket.on("move", (payload) => {
            console.log(payload);
            // TODO: check payload coming from client
            const game = storage.games.get(payload.gameId);

            // Game doesn't exist, ignore
            if (!game) return;

            /** @type {GameState} */
            const gameState = game.state;

            if (gameState.ai) {
                gameState.setPlayerDirection(
                    OPPONENT,
                    new Direction(payload.direction),
                );
            } else {
                const currentPlayer =
                    socket.userId === gameState.firstPlayer ? PLAYER : OPPONENT;

                gameState.setPlayerDirection(
                    currentPlayer,
                    new Direction(payload.direction),
                );
            }
        });

        // Register disconnection event
        socket.on("disconnect", (_reason) => {
            storage.removeClient(socket.userId);
        });
    });

    return io;
}

module.exports = handleWS;
