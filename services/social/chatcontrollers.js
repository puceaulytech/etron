const http = require("http");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;

const {
    decodeJsonBody,
    sendError,
    getLastSegment,
} = require("../helpers/http");
const pool = require("../helpers/db");
const { authenticate } = require("../helpers/tokens");
const { objectIdIncludes } = require("../helpers/mongoldb");

/**
 * Send a message to a friend
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
async function sendMessage(req, res) {
    const userId = authenticate(req, res, jwt);
    if (!userId) return;

    const userCollection = pool.get().collection("users");
    const messageCollection = pool.get().collection("messages");
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
    if (!payload.content || !payload.receiver) {
        sendError(
            res,
            422,
            "E_MISSING_BODY_FIELD",
            "Missing body field, you wont get any other info.",
        );
        return;
    }

    const { friends } = currentUser;
    const receiverId = ObjectId.createFromHexString(payload.receiver);

    if (!friends || !objectIdIncludes(friends, receiverId)) {
        sendError(
            res,
            400,
            "E_NOT_FRIENDS",
            "Tried to send a message to non-friend.",
        );
        return;
    }

    await messageCollection.insertOne({
        content: payload.content,
        receiver: receiverId,
        sender: currentUser._id,
    });

    await notifCollection.insertOne({
        recipient: receiverId,
        type: "CHAT_MESSAGE",
        shouldDisplay: false,
        deferred: false,
        message: {
            senderId: currentUser._id,
            senderUsername: currentUser.username,
            content: payload.content,
        },
    });

    return { message: "Message has been sent" };
}

/**
 * Retreive messages with a certain friend
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
async function getConversationWith(req, res) {
    const userId = authenticate(req, res, jwt);
    if (!userId) return;

    const userCollection = pool.get().collection("users");
    const messageCollection = pool.get().collection("messages");

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

    const friendId = getLastSegment(req);
    // TODO: handle error from createFromHexString
    const friendIdObject = ObjectId.createFromHexString(friendId);

    const messages = await messageCollection
        .find({
            $or: [
                { sender: user._id, receiver: friendIdObject },
                { sender: friendIdObject, receiver: user._id },
            ],
        })
        .toArray();

    return messages;
}

module.exports = { sendMessage, getConversationWith };
