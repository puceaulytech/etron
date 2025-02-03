const storage = require("./storage");
const { decodeJsonBody } = require("../helpers/http");

const endpoints = {
    playagainstai: {
        POST: playAgainstAI,
    },
};

async function playAgainstAI(req, res) {
    const payload = await decodeJsonBody(req);
    const gameId = storage.createAIGame(payload.clientId);
    res.end(JSON.stringify({ gameId }));
}

function handleNotFound(res) {
    res.statusCode = 404;
    res.end();
}

function handleRequest(req, res) {
    const path = req.url.split("/").filter((elem) => elem !== "..");

    const endpoint = endpoints[path[3]];

    if (!endpoint) return handleNotFound(res);

    const handler = endpoint[req.method.toUpperCase()];

    if (!handler) return handleNotFound(res);

    handler(req, res);
}

module.exports = handleRequest;
