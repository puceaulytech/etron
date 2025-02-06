const argon2 = require("argon2");
const http = require("http");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;

const {
    decodeJsonBody,
    decodeCookies,
    createHandler,
    sendError,
} = require("../helpers/http");
const pool = require("../helpers/db");
const {
    authenticate,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require("../helpers/tokens");

const endpoints = {
    login: {
        POST: login,
    },
    register: {
        POST: register,
    },
    refresh: {
        POST: refreshAccess,
    },
    me: {
        GET: getAuthenticatedUser,
    },
};

async function getAuthenticatedUser(req, res) {
    const userId = authenticate(req, res, jwt);
    if (!userId) return;

    const user = await pool
        .get()
        .collection("users")
        .findOne({ _id: ObjectId.createFromHexString(userId) });
    if (!user) {
        sendError(
            res,
            401,
            "E_USER_DOES_NOT_EXIST",
            "User that generated token does not exist anymore.",
        );
        return;
    }

    const { password, ...userInfo } = user;
    res.end(JSON.stringify(userInfo));
}

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

async function refreshAccess(req, res) {
    const payload = await decodeJsonBody(req);
    if (!payload.refreshToken) {
        sendError(res, 400, "E_MISSING_TOKEN", "No refresh token provided.");
        return;
    }

    try {
        const { _id, username } = verifyRefreshToken(jwt, payload.refreshToken);
        const user = await pool
            .get()
            .collection("users")
            .findOne({ _id: ObjectId.createFromHexString(_id), username });
        if (!user) {
            sendError(
                res,
                401,
                "E_USER_DOES_NOT_EXIST", // not sure about that error code
                "User that generated token does not exist anymore.",
            );
            return;
        }

        res.end(
            JSON.stringify({
                accessToken: generateAccessToken(jwt, { username, _id }),
            }),
        );
    } catch (error) {
        sendError(res, 401, "E_UNAUTHORIZED_TOKEN", "Unauthorized token.");
    }
}

module.exports = createHandler(endpoints, (res) => {
    res.statusCode = 404;
    res.end();
});
