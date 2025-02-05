const {
    decodeJsonBody,
    decodeCookies,
    createHandler,
    sendError,
} = require("../helpers/http");
const pool = require("../helpers/db");
const argon2 = require("argon2");

const endpoints = {
    login: {
        POST: login,
    },
    register: {
        POST: register,
    },
};

async function login(req, res) {
    const payload = decodeJsonBody(req);
}

async function register(req, res) {
    const payload = await decodeJsonBody(req);
    const username = payload.username;

    const db = pool.get();
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
        sendError(
            res,
            400,
            "E_USER_ALREADY_EXISTS",
            "Username is already in use, please try another one.",
        );
        return;
    }

    const password = await argon2.hash(payload.password);
    const result = await db
        .collection("users")
        .insertOne({ username, password });
    res.end(JSON.stringify({ _id: result.insertedId, username }));
}

module.exports = createHandler(endpoints, (res) => {
    res.statusCode = 404;
    res.end();
});
