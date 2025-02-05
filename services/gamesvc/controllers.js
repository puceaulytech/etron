const storage = require("./storage");
const { decodeJsonBody, createHandler } = require("../helpers/http");

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

module.exports = createHandler(endpoints, (res) => {
    res.statusCode = 404;
    res.end();
});
