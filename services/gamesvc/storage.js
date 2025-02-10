const crypto = require("crypto");
const { GameState } = require("../helpers/gameutils");

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
    addClient(clientId, socketId) {
        this.wsClients.set(clientId, socketId);
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
        return this.wsClients.get(clientId);
    }

    /**
     * Create a new game against an AI
     * @returns {any} The game ID
     */
    createAIGame(playerId) {
        const id = uuidv4();
        const game = {
            id,
            player: playerId,
            state: GameState.randomPositions(),
            lastTurnTime: Date.now(),
            ready: false,
        };

        this.games.set(id, game);

        return id;
    }

    findGameByPlayerId(playerId) {
        for (const [gameId, gameState] of this.games.entries()) {
            if (gameState.player === playerId) return gameId;
        }

        return null;
    }
}

module.exports = new Storage();
module.exports.Storage = Storage;
