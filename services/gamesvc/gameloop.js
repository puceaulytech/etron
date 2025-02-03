const storage = require("./storage");
const { PLAYER, OPPONENT } = require("../helpers/gameutils");

const TURN_TIME = 500;

let intervalId;

function placePlayersInBoard() {
    // TODO
}

function startGameLoop(io) {
    intervalId = setInterval(() => {
        for (const game of storage.games.values()) {
            if (!game.ready) continue;
            if (Date.now() - game.lastTurnTime <= TURN_TIME) continue;

            game.state.move(PLAYER);
            game.state.move(OPPONENT);

            placePlayersInBoard();
            const socket = io.sockets.sockets.get(game.player);
            socket.emit(
                "gamestate",
                JSON.stringify({ board: game.state.board }),
            );

            game.lastTurnTime = Date.now();
        }
    }, 20);
}

function stopGameLoop() {
    if (intervalId) clearInterval(intervalId);
}

module.exports = { startGameLoop, stopGameLoop };
