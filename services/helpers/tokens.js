const { sendError } = require("./http");

const ACCESS_SECRET = process.env["ACCESS_SECRET"] ?? "very_secret_access";
const REFRESH_SECRET = process.env["REFRESH_SECRET"] ?? "very_secret_refresh";

function generateAccessToken(jwt, user) {
    return jwt.sign(user, ACCESS_SECRET, { expiresIn: "3min" });
}

function generateRefreshToken(jwt, user) {
    // TODO: store the refresh token in the database to be able to revoke it
    const refreshToken = jwt.sign(user, REFRESH_SECRET, { expiresIn: "7d" });
    return refreshToken;
}

function verifyAccessToken(jwt, token) {
    return jwt.verify(token, ACCESS_SECRET);
}

/**
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 * @returns {string | null} The id of the authenticated user or null
 */
function authenticate(req, res, jwt) {
    const token = req.headers["authorization"];
    if (!token) {
        sendError(res, 401, "E_MISSING_TOKEN", "No access token provided.");
        return null;
    }

    const parts = token.split(" ");
    if (parts[0] !== "Bearer" || parts.length !== 2) {
        sendError(res, 400, "E_BAD_TOKEN", "Bad token.");
        return null;
    }

    try {
        const decoded = verifyAccessToken(jwt, parts[1]);
        return decoded._id;
    } catch (error) {
        sendError(res, 401, "E_UNAUTHORIZED_TOKEN", "Unauthorized token.");
        return null;
    }
}

module.exports = { generateAccessToken, generateRefreshToken, authenticate };
