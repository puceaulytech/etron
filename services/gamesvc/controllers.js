const storage = require("./storage");
const jwt = require("jsonwebtoken");
const { createHandler } = require("../helpers/http");
const { authenticate } = require("../helpers/tokens");

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
};

async function play(req, res) {
    const userId = authenticate(req, res, jwt);

    const gameId = storage.createOrJoinGame(userId);

    return { gameId };
}

async function playAgainstAI(req, res) {
    const userId = authenticate(req, res, jwt);

    const gameId = storage.createAIGame(userId);

    return { gameId };
}

async function getOngoingGames(req, res) {
    const userId = authenticate(req, res, jwt);
    const ongoingGameId = storage.findGameByPlayerId(userId);

    return { ongoingGameId };
}

module.exports = createHandler(endpoints, (res) => {
    res.statusCode = 404;
    res.end();
});
