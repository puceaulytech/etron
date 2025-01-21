const crypto = require("crypto");

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

        // FIXME: this stores socket ids, which is volatile
        // and may not be suitable for tracking connected clients
        this.wsClients = new Set();
    }

    /**
     * Register a new client
     * @param {any} clientId Client identifier
     */
    addClient(clientId) {
        this.wsClients.add(clientId);
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
     * Create a new game against an AI
     * @returns {any} The game ID
     */
    createAIGame(playerId) {
        const id = uuidv4();
        // TODO: create game state
        const game = { id, player: playerId };

        this.games.set(id, game);

        return id;
    }
}

module.exports = new Storage();
module.exports.Storage = Storage;
