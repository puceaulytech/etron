const argon2 = require("argon2");
const http = require("http");
const jwt = require("jsonwebtoken");

const {
    decodeJsonBody,
    decodeCookies,
    createHandler,
    sendError,
} = require("../helpers/http");
const pool = require("../helpers/db");
const {
    generateAccessToken,
    generateRefreshToken,
    authenticate,
} = require("../helpers/tokens");

const endpoints = {
    login: {
        POST: login,
    },
    register: {
        POST: register,
    },
};

async function login(req, res) {
    const payload = await decodeJsonBody(req);
    // TODO: check user input
    const username = payload.username;

    const db = pool.get();
    const user = await db.collection("users").findOne({ username });
    if (!user || !(await argon2.verify(user.password, payload.password))) {
        sendError(
            res,
            404,
            "E_INVALID_CREDENTIALS",
            "Provided credentials are invalid.",
        );
        return;
    }

    const refreshToken = generateRefreshToken(jwt, { username, _id: user._id });
    const accessToken = generateAccessToken(jwt, { username, _id: user._id });

    res.end(JSON.stringify({ refreshToken, accessToken }));
}

async function register(req, res) {
    const payload = await decodeJsonBody(req);
    // TODO: check user input
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
