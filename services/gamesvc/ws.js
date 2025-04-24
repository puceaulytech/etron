const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const firebase = require("firebase-admin");
const firebaseApp = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const storage = require("./storage");
const {
    Direction,
    GameState,
    PLAYER,
    OPPONENT,
} = require("../helpers/gameutils");
const { verifyAccessToken } = require("../helpers/tokens");
const ObjectId = require("mongodb").ObjectId;
const pool = require("../helpers/db");
const { Logger } = require("../helpers/logger");
const logger = new Logger("debug");

async function pollPendingNotifs(socket) {
    const notifCollection = pool.get().collection("notifications");

    const filter = {
        recipient: ObjectId.createFromHexString(socket.userId),
        $and: [
            { $or: [{ sended: false }, { sended: { $exists: false } }] },
            { $or: [{ deferred: true }, { deferred: { $exists: false } }] },
        ],
    };

    const pendingNotifs = await notifCollection.find(filter).toArray();

    for (const notif of pendingNotifs) socket.emit("notification", notif);

    await notifCollection.updateMany(filter, { $set: { sended: true } });
}

let firebaseAdmin;

function handleWS(httpServer) {
    const io = new Server(httpServer, {});

    const userCollection = pool.get().collection("users");

    const notifCollection = pool.get().collection("notifications");
    const changeStream = notifCollection.watch();

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            firebaseAdmin = firebaseApp.initializeApp({
                credential: firebase.credential.cert(
                    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
                ),
            });
        } catch (err) {
            logger.warn("cannot initialize firebase admin");
            logger.warn(err);
        }
    }

    changeStream.on("change", async (change) => {
        if (change.operationType === "insert") {
            const notification = change.fullDocument;

            if (notification.broadcast) {
                io.emit("notification", notification);
            } else {
                const socketId = storage.getClientSocketId(
                    notification.recipient.toString(),
                );

                if (socketId) {
                    const socket = io.sockets.sockets.get(socketId);

                    socket.emit("notification", notification);

                    await notifCollection.updateOne(
                        { _id: notification._id },
                        { $set: { sended: true } },
                    );
                }

                if (firebaseAdmin && notification.shouldDisplay) {
                    const user = await userCollection.findOne({
                        _id: notification.recipient,
                    });

                    if (user.fcmToken)
                        await sendPushNotification(user.fcmToken, notification);
                }
            }
        }
    });

    io.use((socket, next) => {
        const accessToken = socket.handshake.auth.accessToken;

        if (!accessToken) return next(new Error("Authentification error"));

        try {
            const decoded = verifyAccessToken(jwt, accessToken);
            socket.userId = decoded._id;
            socket.ingame = socket.handshake.auth.ingame;
            storage.addClient(socket.userId, socket.id, socket.ingame);
        } catch (err) {
            return next(new Error("Invalid token"));
        }

        next();
    });

    io.on("connection", async (socket) => {
        socket.on("ready", (payload) => {
            // TODO: check payload coming from client
            const game = storage.games.get(payload.gameId);

            if (!game) return;

            if (game.ai) {
                game.ready = true;
            } else {
                if (game.firstPlayer === socket.userId) {
                    game.firstReady = true;
                } else if (game.secondPlayer === socket.userId) {
                    game.secondReady = true;
                }

                socket.join(game.id);
            }
        });

        socket.on("move", (payload) => {
            // TODO: check payload coming from client
            const game = storage.games.get(payload.gameId);

            // Game doesn't exist, ignore
            if (!game) return;

            if (game.countdownStatus !== "DONE") return;

            /** @type {GameState} */
            const gameState = game.state;

            if (game.ai) {
                gameState.setPlayerDirection(
                    OPPONENT,
                    new Direction(payload.direction),
                );
            } else {
                const currentPlayer =
                    socket.userId === game.firstPlayer ? PLAYER : OPPONENT;

                gameState.setPlayerDirection(
                    currentPlayer,
                    new Direction(payload.direction),
                );
            }
        });

        socket.on("emote", (payload) => {
            const game = storage.games.get(payload.gameId);

            // Game doesn't exist, ignore
            if (!game) return;
            if (game.ai) return;

            const receiver =
                socket.userId === game.firstPlayer
                    ? game.secondPlayer
                    : game.firstPlayer;

            const socketId = storage.getClientSocketId(receiver);

            if (socketId) {
                const socket = io.sockets.sockets.get(socketId);

                socket.emit("emote", payload);
            }
        });

        // Register disconnection event
        socket.on("disconnect", async (_reason) => {
            storage.removeClient(socket.userId);

            await userCollection.updateOne(
                { _id: ObjectId.createFromHexString(socket.userId) },
                { $set: { online: false } },
            );

            await notifCollection.insertOne({
                type: "USER_DISCONNECT",
                broadcast: true,
                shouldDisplay: false,
                disconnect: {
                    userId: socket.userId,
                },
            });

            storage.clearEmptyGames();
        });

        socket.on("poll_notifs", () => {
            pollPendingNotifs(socket);
        });

        await userCollection.updateOne(
            { _id: ObjectId.createFromHexString(socket.userId) },
            { $set: { online: true } },
        );

        await notifCollection.insertOne({
            type: "USER_CONNECT",
            broadcast: true,
            shouldDisplay: false,
            connect: {
                userId: socket.userId,
            },
        });
    });

    return io;
}

async function sendPushNotification(fcmToken, notification) {
    let title = "";
    let body = "";

    if (notification.type === "FRIEND_REQUEST") {
        title = `${notification.friendRequest.targetUsername} wants to be your friend`;
        body = "Go on the app to accept the friend request";
    } else if (notification.type === "FRIEND_REQUEST_ACCEPTED") {
        title = `${notification.friendRequestAccepted.targetUsername} accepted your friend request`;
        body = "Go on the app to challenge your new friend now";
    } else {
        return;
    }

    await getMessaging(firebaseAdmin).send({
        notification: { title, body },
        token: fcmToken,
        android: {
            priority: "high",
        },
    });
}

module.exports = handleWS;
