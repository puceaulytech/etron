const http = require("http");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;

const {
    decodeJsonBody,
    createHandler,
    sendError,
    getQueryParams,
} = require("../helpers/http");
const pool = require("../helpers/db");
const { authenticate } = require("../helpers/tokens");
const { sanitizeUserInfo } = require("../helpers/sanitizer");

const endpoints = {
    friendrequests: {
        GET: getFriendRequests,
        POST: addFriend,
    },
    friends: {
        POST: acceptFriend,
    },
    users: {
        GET: findUser,
    },
};

/**
 * Find relevant users by username
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
async function findUser(req, res) {
    const params = getQueryParams(req);
    const username = params.get("username");

    if (!username) {
        sendError(
            res,
            422,
            "E_MISSING_QUERY_SEARCH",
            "No username provided for search ('username').",
        );
        return;
    }

    if (username.length < 3) return [];

    const userCollection = pool.get().collection("users");

    await userCollection.createIndex({ username: "text" });

    const results = await userCollection
        .find({ username: { $regex: username, $options: "i" } })
        .toArray();
    return results.map(sanitizeUserInfo);
}

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

    if (user.friends.includes(payload.newFriendId)) {
        sendError(
            res,
            400,
            "E_ALREADY_IN_FRIENDS",
            "User is already in friends / friend requests.",
        );
        return;
    }

    const friend = await userCollection.findOne({
        _id: ObjectId.createFromHexString(payload.newFriendId),
    });
    if (!friend) {
        sendError(
            res,
            401,
            "E_USER_DOES_NOT_EXIST",
            "Tried to add a non-existing user as friend.",
        );
        return;
    }

    if (friend.friendRequests.includes(userId)) {
        sendError(
            res,
            400,
            "E_ALREADY_IN_FRIENDS",
            "User is already in friends / friend requests.",
        );
        return;
    }

    if (user.friendRequests.includes(payload.newFriendId)) {
        await userCollection.updateOne(
            { _id: ObjectId.createFromHexString(payload.newFriendId) },
            { $push: { friends: userId } },
        );
        await userCollection.updateOne(
            { _id: ObjectId.createFromHexString(userId) },
            {
                $push: { friends: payload.newFriendId },
                $pull: { friendRequests: payload.newFriendId },
            },
        );
    } else {
        await userCollection.updateOne(
            { _id: ObjectId.createFromHexString(payload.newFriendId) },
            { $push: { friendRequests: userId } },
        );
    }

    return { ok: "bro" };
}

/**
 * Accept a pending friend request
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
async function acceptFriend(req, res) {
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
            "No user id provided to accept friend request ('newFriendId').",
        );
        return;
    }

    const { friendRequests } = user;
    if (!friendRequests.includes(payload.newFriendId)) {
        sendError(
            res,
            400,
            "E_NOT_IN_FRIEND_REQUESTS",
            "Tried to accept a non-existing friend request.",
        );
        return;
    }

    await userCollection.updateOne(
        { _id: ObjectId.createFromHexString(payload.newFriendId) },
        { $push: { friends: userId } },
    );
    await userCollection.updateOne(
        { _id: ObjectId.createFromHexString(userId) },
        {
            $push: { friends: payload.newFriendId },
            $pull: { friendRequests: payload.newFriendId },
        },
    );

    return { still: "ok bro" };
}

module.exports = createHandler(endpoints, (res) => {
    res.statusCode = 404;
    res.end();
});
