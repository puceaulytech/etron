const storage = require("./storage");
const { PLAYER, OPPONENT, GameState } = require("../helpers/gameutils");

const TURN_TIME = 500;

let intervalId;

/**
 * @param {GameState} gameState
 */
function placePlayersInBoard(gameState) {
    const board = JSON.parse(JSON.stringify(gameState.board));
    board[gameState.playerPosition.row][gameState.playerPosition.column] = 2;
    board[gameState.opponentPosition.row][gameState.opponentPosition.column] =
        -2;
    return board;
}

function startGameLoop(io) {
    intervalId = setInterval(() => {
        for (const game of storage.games.values()) {
            if (!game.ready) continue;
            if (Date.now() - game.lastTurnTime <= TURN_TIME) continue;

            game.state.move(PLAYER);
            game.state.move(OPPONENT);

            // The line bellow causes big problems
            const socket = io.sockets.sockets.get(game.player);
            socket.emit("gamestate", {
                board: placePlayersInBoard(game.state),
            });

            // TODO: check if game is over

            game.lastTurnTime = Date.now();
        }
    }, 20);
}

function stopGameLoop() {
    if (intervalId) clearInterval(intervalId);
}

module.exports = { startGameLoop, stopGameLoop };
