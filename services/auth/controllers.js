const { decodeJsonBody, decodeCookies } = require("../helpers/http");

const endpoints = {
    login: {
        POST: login,
    },
};

async function login(req, res) {
    const payload = decodeJsonBody(req);
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
