const http = require("http");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;

const {
    decodeJsonBody,
    createHandler,
    sendError,
    getQueryParams,
    getLastSegment,
} = require("../helpers/http");
const pool = require("../helpers/db");
const { authenticate } = require("../helpers/tokens");
const { sanitizeUserInfo } = require("../helpers/sanitizer");

const endpoints = {
    friendrequests: {
        GET: getFriendRequests,
        POST: acceptFriend,
        DELETE: deleteFriendRequest,
    },
    friends: {
        GET: getFriends,
        POST: addFriend,
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
    const userId = authenticate(req, res, jwt);
    if (!userId) return;

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
        .find({
            username: { $regex: username, $options: "i" },
            _id: { $ne: ObjectId.createFromHexString(userId) },
        })
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

    if (!friendRequests) return [];

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
    const notifCollection = pool.get().collection("notifications");

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

    if (
        currentUser.friends &&
        currentUser.friends.includes(payload.newFriendId)
    ) {
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

    if (friend.friendRequests && friend.friendRequests.includes(userId)) {
        sendError(
            res,
            400,
            "E_ALREADY_IN_FRIENDS",
            "User is already in friends / friend requests.",
        );
        return;
    }

    if (
        currentUser.friendRequests &&
        currentUser.friendRequests.includes(payload.newFriendId)
    ) {
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

    await notifCollection.insertOne({
        recipient: ObjectId.createFromHexString(payload.newFriendId),
        type: "FRIEND_REQUEST",
        shouldDisplay: true,
        friendRequest: {
            targetUsername: currentUser.username,
        },
    });

    return { ok: "bro" };
}

/**
 * Sends the user its friend list
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
async function getFriends(req, res) {
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

    const { friends } = user;

    if (!friends) return [];

    const friendsObjectIds = friends.map((id) =>
        ObjectId.createFromHexString(id),
    );

    const result = await userCollection
        .find({ _id: { $in: friendsObjectIds } })
        .toArray();

    return result.map((friend) => sanitizeUserInfo(friend));
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
    const notifCollection = pool.get().collection("notifications");

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

    const { friendRequests } = currentUser;
    if (!friendRequests || !friendRequests.includes(payload.newFriendId)) {
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

    await notifCollection.insertOne({
        recipient: ObjectId.createFromHexString(payload.newFriendId),
        type: "FRIEND_REQUEST_ACCEPTED",
        shouldDisplay: true,
        friendRequestAccepted: {
            targetUsername: currentUser.username,
        },
    });

    return { still: "ok bro" };
}

/**
 * Decline a pending friend request
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
async function deleteFriendRequest(req, res) {
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

    const friendRequestId = getLastSegment(req);

    const { friendRequests } = user;
    if (!friendRequests || !friendRequests.includes(friendRequestId)) {
        sendError(
            res,
            400,
            "E_NOT_IN_FRIEND_REQUESTS",
            "Tried to accept a non-existing friend request.",
        );
        return;
    }

    await userCollection.updateOne(
        { _id: ObjectId.createFromHexString(userId) },
        { $pull: { friendRequests: friendRequestId } },
    );

    return { message: "Friend request deleted" };
}

module.exports = createHandler(endpoints, (res) => {
    res.statusCode = 404;
    res.end();
});
