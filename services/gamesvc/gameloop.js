const { stateless } = require("./ai");
const storage = require("./storage");
const {
    PLAYER,
    OPPONENT,
    GameState,
    GameResult,
} = require("../helpers/gameutils");

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
        const finishedGames = [];
        for (const game of storage.games.values()) {
            if (!game.ready) continue;
            if (Date.now() - game.lastTurnTime <= TURN_TIME) continue;

            // TODO: move this somewhere else so that it doesn't use game time to think?
            const aiMove = stateless.nextMove(game.state);
            game.state.moveTo(PLAYER, aiMove);
            game.state.move(OPPONENT);

            /** @type {GameResult} */
            const result = game.state.gameResult();
            if (!result.isUnfinished()) finishedGames.push(game.id);

            // The line bellow causes big problems
            const socket = io.sockets.sockets.get(game.player);
            socket.emit("gamestate", {
                board: placePlayersInBoard(game.state),
                result,
            });

            game.lastTurnTime = Date.now();
        }

        for (const gameId of finishedGames) storage.games.delete(gameId);
    }, 20);
}

function stopGameLoop() {
    if (intervalId) clearInterval(intervalId);
}

module.exports = { startGameLoop, stopGameLoop };
