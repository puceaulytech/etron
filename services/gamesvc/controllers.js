const storage = require("./storage");
const jwt = require("jsonwebtoken");
const { createHandler, getQueryParams } = require("../helpers/http");
const { authenticate } = require("../helpers/tokens");
const { ObjectId } = require("mongodb");
const pool = require("../helpers/db");

const endpoints = {
    ongoinggames: {
        GET: getOngoingGames,
    },
    playagainstai: {
        POST: playAgainstAI,
    },
    play: {
        POST: play,
    },
    onlinecount: {
        GET: getOnlineCount,
    },
};

async function play(req, res) {
    const rawUserId = authenticate(req, res, jwt);

    const gameId = storage.createOrJoinGame(rawUserId);

    return { gameId };
}

async function playAgainstAI(req, res) {
    const rawUserId = authenticate(req, res, jwt);

    const gameId = storage.createAIGame(rawUserId);

    return { gameId };
}

async function getOngoingGames(req, res) {
    const userId = authenticate(req, res, jwt);
    const params = getQueryParams(req);

    let ongoingGameId = storage.findGameByPlayerId(
        userId,
        params.get("gameMode"),
    );

    // Because ongoingGameId is undefined, it doesn't even appear as a JSON key, because JS
    if (!ongoingGameId) ongoingGameId = null;

    return { ongoingGameId };
}

async function getOnlineCount(_req, _res) {
    return { count: storage.countClients() };
}

module.exports = createHandler(endpoints, (res) => {
    res.statusCode = 404;
    res.end();
});
