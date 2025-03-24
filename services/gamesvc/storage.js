const crypto = require("crypto");
const { GameState } = require("../helpers/gameutils");

const { Logger } = require("../helpers/logger");
const logger = new Logger("debug");

function uuidv4() {
    const bytes = crypto.randomBytes(16);

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const uuid = [
        bytes.toString("hex", 0, 4),
        bytes.toString("hex", 4, 6),
        bytes.toString("hex", 6, 8),
        bytes.toString("hex", 8, 10),
        bytes.toString("hex", 10, 16),
    ].join("-");

    return uuid;
}

class Storage {
    constructor() {
        this.games = new Map();

        this.wsClients = new Map();
    }

    /**
     * Register a new client
     * @param {string} clientId Client ID
     * @param {string} socket socket.io ID
     */
    addClient(clientId, socketId, ingame) {
        this.wsClients.set(clientId, { socketId, ingame });
    }

    /**
     * Remove a client. This has no effect if the provided clientId
     * does not exist
     * @param {any} socketId Client identifier
     */
    removeClient(clientId) {
        this.wsClients.delete(clientId);
    }

    /**
     * Retrieves the socket.io id of a client
     *
     * @param {string} clientId The client ID
     * @returns {string} The socket.io ID
     */
    getClientSocketId(clientId) {
        const infos = this.wsClients.get(clientId);

        if (!infos) return;

        return infos.socketId;
    }

    isClientInGame(clientId) {
        const infos = this.wsClients.get(clientId);

        if (!infos) return;

        return infos.ingame;
    }

    countClients() {
        return this.wsClients.size;
    }

    /**
     * Create a new game against an AI
     * @returns {any} The game ID
     */
    createAIGame(playerId) {
        const id = uuidv4();
        const game = {
            id,
            ai: true,
            player: playerId,
            state: GameState.randomPositions(),
            lastTurnTime: Date.now(),
            ready: false,
        };

        this.games.set(id, game);

        return id;
    }

    createOrJoinGame(player) {
        const freeGame = this.games
            .values()
            .find((g) => g.secondPlayer === null);

        if (freeGame) {
            logger.debug("there is a free game, joining...");
            freeGame.secondPlayer = player;

            logger.debug(
                `starting game, ${freeGame.firstPlayer} vs ${freeGame.secondPlayer}`,
            );

            return freeGame.id;
        }

        logger.debug("creating new online game");

        const id = uuidv4();
        const game = {
            id,
            ai: false,
            state: GameState.randomPositions(),
            lastTurnTime: Date.now(),
            firstPlayer: player,
            secondPlayer: null,
            firstReady: false,
            secondReady: false,
        };

        this.games.set(id, game);

        return id;
    }

    findGameInMatchmaking() {
        return this.games.values().find((g) => g.secondPlayer === null);
    }

    findGameByPlayerId(playerId, gameMode) {
        for (const [gameId, gameState] of this.games.entries()) {
            if (gameState.ai && gameMode === "ai") {
                if (gameState.player === playerId) return gameId;
            } else if (gameMode === "online") {
                if (
                    gameState.firstPlayer === playerId ||
                    gameState.secondPlayer === playerId
                )
                    return gameId;
            }

            return null;
        }
    }

    clearEmptyGames() {
        const gamesToRemove = [];

        for (const game of this.games.values()) {
            if (game.ai) {
                if (!this.isClientInGame(game.playerId)) {
                    // Client has disconnected
                    gamesToRemove.push(game.id);
                }
            } else {
                if (!this.isClientInGame(game.firstPlayer)) {
                    if (
                        game.secondPlayer === undefined ||
                        !this.isClientInGame(game.secondPlayer)
                    ) {
                        // Still in matchmaking
                        gamesToRemove.push(game.id);
                    }
                }
            }
        }

        for (const gameToRemove of gamesToRemove) {
            this.games.delete(gameToRemove);
            logger.debug(`removing game ${gameToRemove} because of inactivity`);
        }
    }
}

module.exports = new Storage();
module.exports.Storage = Storage;
