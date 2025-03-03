const http = require("http");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;

const { decodeJsonBody, createHandler, sendError } = require("../helpers/http");
const pool = require("../helpers/db");
const { authenticate } = require("../helpers/tokens");
const { sanitizeUserInfo } = require("../helpers/sanitizer");

const endpoints = {
    friendrequests: {
        GET: getFriendRequests,
        POST: addFriend,
    },
};

/**
 * Sends the user its pending friend requests
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
async function getFriendRequests(req, res) {
    const userId = authenticate(req, res, jwt);
    if (!userId) return;

    const userCollection = pool.get().collection("users");

    const user = await userCollection.findOne({
        _id: ObjectId.createFromHexString(userId),
    });
    if (!user) {
        sendError(
            res,
            401,
            "E_USER_DOES_NOT_EXIST",
            "User that generated token does not exist anymore.",
        );
        return;
    }

    const { friendRequests } = user;

    const result = [];
    const promises = [];
    for (const friendId of friendRequests) {
        promises.push(
            userCollection
                .findOne({ _id: ObjectId.createFromHexString(friendId) })
                .then((doc) => {
                    if (doc) result.push(sanitizeUserInfo(doc));
                    return true;
                }),
        );
    }

    await Promise.all(promises);
    return result;
}

/**
 * Adds a user
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
async function addFriend(req, res) {
    const userId = authenticate(req, res, jwt);
    if (!userId) return;

    const userCollection = pool.get().collection("users");

    const user = await userCollection.findOne({
        _id: ObjectId.createFromHexString(userId),
    });
    if (!user) {
        sendError(
            res,
            401,
            "E_USER_DOES_NOT_EXIST",
            "User that generated token does not exist anymore.",
        );
        return;
    }

    const payload = await decodeJsonBody(req);
    if (!payload.newFriendId) {
        sendError(
            res,
            422,
            "E_MISSING_BODY_FIELD",
            "No user id provided for friend request ('newFriendId').",
        );
        return;
    }

    await userCollection.updateOne(
        { _id: ObjectId.createFromHexString(payload.newFriendId) },
        { $push: { friendRequests: userId } },
    );

    return { ok: "bro" };
}

module.exports = createHandler(endpoints, (res) => {
    res.statusCode = 404;
    res.end();
});
