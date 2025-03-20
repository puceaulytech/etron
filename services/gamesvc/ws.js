const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
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

function handleWS(httpServer) {
    const io = new Server(httpServer, {});

    const userCollection = pool.get().collection("users");

    const notifCollection = pool.get().collection("notifications");
    const changeStream = notifCollection.watch();

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
            }
        }
    });

    io.use((socket, next) => {
        const accessToken = socket.handshake.auth.accessToken;

        if (!accessToken) return next(new Error("Authentification error"));

        try {
            const decoded = verifyAccessToken(jwt, accessToken);
            socket.userId = decoded._id;
            storage.addClient(socket.userId, socket.id);
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
            console.log(payload);
            // TODO: check payload coming from client
            const game = storage.games.get(payload.gameId);

            // Game doesn't exist, ignore
            if (!game) return;

            /** @type {GameState} */
            const gameState = game.state;

            if (gameState.ai) {
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

module.exports = handleWS;
