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
const { isUsernameValid } = require("../helpers/sanitizer");

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

/**
 * Sends information about the authenticated user to the client
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
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

    return userInfo;
}

/**
 * Generates and sends access and refresh tokens to the client
 * if the provided credentials match the registered user
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
async function login(req, res) {
    const payload = await decodeJsonBody(req);
    // TODO: check user input
    const username = payload.username;

    const db = pool.get();
    const user = await db.collection("users").findOne({ username });
    if (!user || !(await argon2.verify(user.password, payload.password))) {
        sendError(
            res,
            401,
            "E_INVALID_CREDENTIALS",
            "Provided credentials are invalid.",
        );
        return;
    }

    const refreshToken = generateRefreshToken(jwt, { username, _id: user._id });
    const accessToken = generateAccessToken(jwt, { username, _id: user._id });

    return { refreshToken, accessToken };
}

/**
 * Adds a new user to the database with the provided credentials
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
async function register(req, res) {
    const payload = await decodeJsonBody(req);

    if (
        !payload.username ||
        !payload.password ||
        payload.username === "" ||
        payload.password === ""
    ) {
        sendError(
            res,
            400,
            "E_INVALID_CREDENTIALS",
            "One of username or password field is missing.",
        );
        return;
    }

    const username = payload.username;

    if (!isUsernameValid(username)) {
        sendError(
            res,
            400,
            "E_INVALID_USERNAME",
            "Username contains bad characters / is too long / is too short.",
        );
        return;
    }

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
        .insertOne({ username, password, online: false, elo: 1500 });

    return { _id: result.insertedId, username };
}

/**
 * Generates and sends a new access token given a valid refresh token
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
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

        return {
            accessToken: generateAccessToken(jwt, { username, _id }),
        };
    } catch (error) {
        sendError(res, 401, "E_UNAUTHORIZED_TOKEN", "Unauthorized token.");
    }
}

module.exports = createHandler(endpoints, (res) => {
    res.statusCode = 404;
    res.end();
});
