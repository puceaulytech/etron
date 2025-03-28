const http = require("http");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;

const { sendError } = require("../helpers/http");
const pool = require("../helpers/db");
const { authenticate } = require("../helpers/tokens");

const ytAPIKey = process.env["YT_KEY"] ?? "no_key";
const queries = ["linux", "clash+royale", "cat"];
const maxResults = 10;

/**
 * Get a random Youtube video
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
async function getRandomYoutubeVideo(req, res) {
    const userId = authenticate(req, res, jwt);
    if (!userId) return;

    const userCollection = pool.get().collection("users");

    const currentUser = await userCollection.findOne({
        _id: ObjectId.createFromHexString(userId),
    });
    if (!currentUser) {
        sendError(
            res,
            401,
            "E_USER_DOES_NOT_EXIST",
            "User that generated token does not exist anymore.",
        );
        return;
    }

    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    const params = new URLSearchParams({
        part: "snippet",
        maxResults,
        q: randomQuery,
        type: "video",
        relevanceLanguage: "en",
        key: ytAPIKey,
    });
    const url = `https://www.googleapis.com/youtube/v3/search?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.items.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.items.length);
        const videoId = data.items[randomIndex].id.videoId;
        return { video: `https://www.youtube.com/watch?v=${videoId}` };
    } else {
        sendError(
            res,
            503, // why not?
            "E_COULD_NOT_PROCESS",
            "Server could not process request.",
        );
    }
}

module.exports = { getRandomYoutubeVideo };
