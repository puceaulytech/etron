const argon2 = require("argon2");
const http = require("http");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;
const QRCode = require("qrcode");
const speakeasy = require("speakeasy");

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
const { isUsernameValid, sanitizeUserInfo } = require("../helpers/sanitizer");

const endpoints = {
    login: {
        POST: login,
    },
    register: {
        POST: register,
    },
    resetpassword: {
        POST: resetPassword,
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

    const users = await pool
        .get()
        .collection("users")
        .aggregate([
            {
                $setWindowFields: {
                    sortBy: { elo: -1 },
                    output: {
                        rank: { $rank: {} },
                    },
                },
            },
            {
                $match: { _id: ObjectId.createFromHexString(userId) },
            },
        ])
        .toArray();

    if (users.length === 0) {
        sendError(
            res,
            401,
            "E_USER_DOES_NOT_EXIST",
            "User that generated token does not exist anymore.",
        );
        return;
    }

    const user = users[0];

    const gameResultsCollection = pool.get().collection("gameResults");
    const gameHistory = await gameResultsCollection
        .find({
            $or: [{ winner: user._id }, { loser: user._id }],
        })
        .toArray();

    const userInfo = sanitizeUserInfo(user);

    return { ...userInfo, gameHistory };
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

    if (!payload || !payload.username || !payload.password) {
        sendError(
            res,
            400,
            "E_INVALID_CREDENTIALS",
            "One of username or password field is missing.",
        );
        return;
    }

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
        !payload ||
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
    const totpSecret = speakeasy.generateSecret({
        name: `eTron - ${username}`,
        length: 20,
    });

    const result = await db.collection("users").insertOne({
        username,
        password,
        totpSecret: totpSecret.base32,
        online: false,
        elo: 1500,
        createdAt: Date.now(),
    });

    const qrCode = await QRCode.toDataURL(totpSecret.otpauth_url, { scale: 8 });

    return {
        _id: result.insertedId,
        username,
        qrCode,
        totpSecret: totpSecret.base32,
    };
}

async function resetPassword(req, res) {
    const payload = await decodeJsonBody(req);

    if (
        !payload ||
        !payload.username ||
        !payload.password ||
        !payload.totpCode ||
        payload.password === ""
    ) {
        sendError(
            res,
            400,
            "E_INVALID_CREDENTIALS",
            "One of username, password or totpCode field is missing.",
        );
        return;
    }

    const userCollection = pool.get().collection("users");

    const currentUser = await userCollection.findOne({
        username: payload.username,
    });
    if (!currentUser) {
        sendError(res, 400, "E_USER_NOT_FOUND", "User not found");
        return;
    }

    const verified = speakeasy.totp.verify({
        secret: currentUser.totpSecret,
        encoding: "base32",
        token: payload.totpCode,
    });

    if (!verified) {
        sendError(res, 400, "E_INVALID_TOTP_CODE", "Invalid TOTP code");
        return;
    }

    const password = await argon2.hash(payload.password);

    await userCollection.updateOne(
        { _id: currentUser._id },
        { $set: { password } },
    );

    return { ok: true };
}

/**
 * Generates and sends a new access token given a valid refresh token
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
async function refreshAccess(req, res) {
    const payload = await decodeJsonBody(req);
    if (!payload || !payload.refreshToken) {
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
