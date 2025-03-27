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
    }
}

function sendGame(game, result, io) {
    if (game.ai) {
        const socketId = storage.getClientSocketId(game.player);

        if (socketId) {
            const socket = io.sockets.sockets.get(socketId);

            sendAIGame(game, result, socket);
        }
    } else {
        sendOnlineGame(game, result, io);
    }
}

function sendCountdown(game, delay, io) {
    if (game.ai) {
        const socketId = storage.getClientSocketId(game.player);

        if (socketId) {
            const socket = io.sockets.sockets.get(socketId);

            socket.emit("countdown_start", { gameId: game.id, delay });
        }
    } else {
        io.to(game.id).emit("countdown_start", { gameId: game.id, delay });
    }
}

function sendAIGame(game, result, socket) {
    socket.emit("gamestate", {
        board: result.isUnfinished() ? placePlayersInBoard(game.state) : null,
        result,
        gameId: game.id,
        playerRoundWon: game.playerRoundWon,
        aiRoundWon: game.aiRoundWon,
    });
}

function sendOnlineGame(game, result, io) {
    io.to(game.id).emit("gamestate", {
        board: result.isUnfinished() ? placePlayersInBoard(game.state) : null,
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

function startGameLoop(io) {
    intervalId = setInterval(() => {
        const finishedGames = [];

        for (const game of storage.games.values()) {
            if (game.ai) {
                if (!game.ready) continue;
            } else {
                if (!game.firstReady || !game.secondReady) continue;
            }

            if (game.countdownStatus === "IN_PROGRESS") continue;

            if (game.countdownStatus === "NOT_STARTED") {
                game.countdownStatus = "IN_PROGRESS";

                sendCountdown(game, 3, io);

                setTimeout(() => {
                    sendCountdown(game, 2, io);

                    setTimeout(() => {
                        sendCountdown(game, 1, io);

                        setTimeout(() => {
                            game.countdownStatus = "DONE";
                        }, 1000);
                    }, 1000);
                }, 1000);

                continue;
            }

            if (Date.now() - game.lastTurnTime <= TURN_TIME) continue;

            if (game.ai) {
                // TODO: move this somewhere else so that it doesn't use game time to think?
                const aiMove = stateless.nextMove(game.state);
                if (aiMove) {
                    game.state.moveTo(PLAYER, aiMove);
                } else {
                    game.state.move(PLAYER);
                }
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

            sendGame(game, result, io);

            game.lastTurnTime = Date.now();
        }

        for (const gameId of finishedGames) {
            const game = storage.games.get(gameId);

            updateRounds(game);

            sendGame(game, game.state.gameResult(), io);

            if (gameDone(game)) {
                if (!game.ai) {
                    handleScore(
                        game.firstPlayer,
                        game.secondPlayer,
                        game.firstPlayerRoundWon > game.secondPlayerRoundWon,
                    );
                }

                storage.games.delete(gameId);
            } else {
                game.state = GameState.randomPositions();
                game.countdownStatus = "NOT_STARTED";
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
