const { Server } = require("socket.io");
const storage = require("./storage");
const { Direction, GameState, OPPONENT } = require("../helpers/gameutils");

function handleWS(httpServer) {
    const io = new Server(httpServer, {});

    io.on("connection", (socket) => {
        storage.addClient(socket.id);

        socket.on("ready", (payload) => {
            // TODO: check payload coming from client
            const game = storage.games.get(payload.gameId);
            if (game) game.ready = true;
            console.log(payload);
        });

        socket.on("move", (payload) => {
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
            storage.removeClient(socket.id);
        });
    });

    return io;
}

module.exports = handleWS;
