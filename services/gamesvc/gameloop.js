const { stateless } = require("./ai");
const storage = require("./storage");
const {
    PLAYER,
    OPPONENT,
    GameState,
    GameResult,
} = require("../helpers/gameutils");
const { ObjectId } = require("mongodb");
const pool = require("../helpers/db");
const { Logger } = require("../helpers/logger");
const logger = new Logger("debug");

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

const ROUND_GOAL = 3;

function gameDone(game) {
    if (game.ai) {
        return (
            game.playerRoundWon === ROUND_GOAL || game.aiRoundWon === ROUND_GOAL
        );
    } else {
        return (
            game.firstPlayerRoundWon === ROUND_GOAL ||
            game.secondPlayerRoundWon === ROUND_GOAL
        );
    }
}

function updateRounds(game) {
    const result = game.state.gameResult();

    if (result.type === "PLAYER_WIN") {
        if (game.ai) {
            if (result.winner === 1) {
                game.aiRoundWon++;
            } else {
                game.playerRoundWon++;
            }

            logger.debug(
                `next round for game ${game.id}, player: ${game.playerRoundWon} vs ai: ${game.aiRoundWon}`,
            );
        } else {
            if (result.winner === 1) {
                game.firstPlayerRoundWon++;
            } else {
                game.secondPlayerRoundWon++;
            }

            logger.debug(
                `next round for game ${game.id}, p1: ${game.firstPlayerRoundWon} vs p2: ${game.secondPlayerRoundWon}`,
            );
        }

        game.state = GameState.randomPositions();
    }
}

function startGameLoop(io) {
    intervalId = setInterval(() => {
        const finishedGames = [];

        for (const game of storage.games.values()) {
            if (game.ai) {
                if (!game.ready) continue;
            } else {
                if (!game.firstReady || !game.secondReady) continue;
            }

            if (Date.now() - game.lastTurnTime <= TURN_TIME) continue;

            if (game.ai) {
                // TODO: move this somewhere else so that it doesn't use game time to think?
                const aiMove = stateless.nextMove(game.state);
                game.state.moveTo(PLAYER, aiMove);
                game.state.move(OPPONENT);
            } else {
                game.state.move(PLAYER);
                game.state.move(OPPONENT);
            }

            /** @type {GameResult} */
            const result = game.state.gameResult();

            if (!result.isUnfinished()) {
                finishedGames.push(game.id);
            }

            if (game.ai) {
                // If it's an AI game, directly send the game state to the player

                const socketId = storage.getClientSocketId(game.player);

                if (socketId) {
                    const socket = io.sockets.sockets.get(socketId);
                    socket.emit("gamestate", {
                        board: result.isUnfinished()
                            ? placePlayersInBoard(game.state)
                            : null,
                        result,
                        gameId: game.id,
                        playerRoundWon: game.playerRoundWon,
                        aiRoundWon: game.aiRoundWon,
                    });
                }
            } else {
                io.to(game.id).emit("gamestate", {
                    board: result.isUnfinished()
                        ? placePlayersInBoard(game.state)
                        : null,
                    result,
                    gameId: game.id,
                    sides: {
                        [game.firstPlayer]: "left",
                        [game.secondPlayer]: "right",
                    },
                    positions: {
                        [game.firstPlayer]: game.state.playerPosition,
                        [game.secondPlayer]: game.state.opponentPosition,
                    },
                    rounds: {
                        [game.firstPlayer]: game.firstPlayerRoundWon,
                        [game.secondPlayer]: game.secondPlayerRoundWon,
                    },
                });
            }

            game.lastTurnTime = Date.now();
        }

        for (const gameId of finishedGames) {
            const game = storage.games.get(gameId);

            updateRounds(game);

            if (gameDone(game)) {
                if (!game.ai) {
                    handleScore(
                        game.firstPlayer,
                        game.secondPlayer,
                        game.firstPlayerRoundWon > game.secondPlayerRoundWon,
                    );
                }

                storage.games.delete(gameId);
            }
        }
    }, 20);
}

const ELO_K = 40;

async function handleScore(
    rawFirstPlayerId,
    rawSecondPlayerId,
    firstPlayerWon,
) {
    const firstPlayerId = ObjectId.createFromHexString(rawFirstPlayerId);
    const secondPlayerId = ObjectId.createFromHexString(rawSecondPlayerId);

    const userCollection = pool.get().collection("users");

    const firstPlayer = await userCollection.findOne({
        _id: firstPlayerId,
    });
    const secondPlayer = await userCollection.findOne({
        _id: secondPlayerId,
    });

    const firstPlayerExpected =
        1 / (1 + Math.pow(10, (secondPlayer.elo - firstPlayer.elo) / 400));
    const secondPlayerExpected =
        1 / (1 + Math.pow(10, (firstPlayer.elo - secondPlayer.elo) / 400));

    const firstPlayerOutcome = firstPlayerWon ? 1 : 0;
    const secondPlayerOutcome = firstPlayerWon ? 0 : 1;

    const firstPlayerNew =
        firstPlayer.elo + ELO_K * (firstPlayerOutcome - firstPlayerExpected);
    const secondPlayerNew =
        secondPlayer.elo + ELO_K * (secondPlayerOutcome - secondPlayerExpected);

    await userCollection.updateOne(
        { _id: firstPlayerId },
        { $set: { elo: firstPlayerNew } },
    );
    await userCollection.updateOne(
        { _id: secondPlayerId },
        { $set: { elo: secondPlayerNew } },
    );
}

function stopGameLoop() {
    if (intervalId) clearInterval(intervalId);
}

module.exports = { startGameLoop, stopGameLoop };
