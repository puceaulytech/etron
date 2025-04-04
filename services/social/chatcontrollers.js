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
const { Logger } = require("../helpers/logger");
const logger = new Logger("debug");

const { generateMessage } = require("./chatbot");
const BOT_USERNAME = process.env["BOT_USERNAME"];

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
    if (!payload || !payload.content || !payload.receiver) {
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
        isRead: false,
    });

    const friend = await userCollection.findOne({
        _id: receiverId,
    });
    if (friend.username === BOT_USERNAME) {
        replyWithChatBot(friend._id, currentUser).catch((err) => {
            logger.warn("cannot reply with chatbot");
            logger.warn(err);
        });
    } else {
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
    }

    return { message: "Message has been sent" };
}

async function replyWithChatBot(botUserId, currentUser) {
    const messageCollection = pool.get().collection("messages");
    const notifCollection = pool.get().collection("notifications");

    const messages = await messageCollection
        .find({
            $or: [
                { sender: currentUser._id, receiver: botUserId },
                { sender: botUserId, receiver: currentUser._id },
            ],
        })
        .toArray();

    const conversation = messages.map((m) => {
        let role =
            m.sender.toString() === currentUser._id.toString()
                ? "user"
                : "assistant";

        return {
            role,
            content: m.content,
        };
    });

    const chatbotMessage = await generateMessage(
        currentUser.username,
        conversation,
    );

    if (!chatbotMessage) return;

    await messageCollection.insertOne({
        content: chatbotMessage,
        receiver: currentUser._id,
        sender: botUserId,
        isRead: false,
    });

    await notifCollection.insertOne({
        recipient: currentUser._id,
        type: "CHAT_MESSAGE",
        shouldDisplay: false,
        deferred: false,
        message: {
            senderId: botUserId,
            senderUsername: BOT_USERNAME,
            content: chatbotMessage,
        },
    });
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
                { winnerId: user._id, loserId: friendIdObject },
                { loserId: user._id, winnerId: friendIdObject },
            ],
        })
        .toArray();

    // Mark the messages we have received as read
    await messageCollection.updateMany(
        { sender: friendIdObject, receiver: user._id },
        { $set: { isRead: true } },
    );

    return messages;
}

/**
 * Mark a conversion as read without returning any messages
 *
 * This is used by clients to acknowledge messages received via socket.io
 *
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 */
async function readConversation(req, res) {
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

    await messageCollection.updateMany(
        { sender: friendIdObject, receiver: user._id },
        { $set: { isRead: true } },
    );

    return { ok: true };
}

module.exports = { sendMessage, getConversationWith, readConversation };
