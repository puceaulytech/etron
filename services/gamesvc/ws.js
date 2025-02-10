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
            if (game) game.ready = true;
            console.log(payload);
        });

        socket.on("move", (payload) => {
            console.log(payload);
            // TODO: check payload coming from client
            const game = storage.games.get(payload.gameId);
            /** @type {GameState} */
            const gameState = game.state;
            gameState.setPlayerDirection(
                OPPONENT,
                new Direction(payload.direction),
            );
        });

        // Register disconnection event
        socket.on("disconnect", (_reason) => {
            storage.removeClient(socket.userId);
        });
    });

    return io;
}

module.exports = handleWS;
