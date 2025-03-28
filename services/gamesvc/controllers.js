const storage = require("./storage");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const ytController = require("./youtubecontroller");

const {
    createHandler,
    getQueryParams,
    sendError,
    decodeJsonBody,
    getLastSegment,
} = require("../helpers/http");
const { authenticate } = require("../helpers/tokens");
const pool = require("../helpers/db");
const { Logger } = require("../helpers/logger");
const logger = new Logger("debug");

const endpoints = {
    ongoinggames: {
        GET: getOngoingGames,
    },
    playagainstai: {
        POST: playAgainstAI,
    },
    play: {
        POST: play,
    },
    onlinecount: {
        GET: getOnlineCount,
    },
    challenges: {
        POST: createChallenge,
    },
    acceptchallenge: {
        POST: acceptChallenge,
    },
    randomvideo: {
        GET: ytController.getRandomYoutubeVideo,
    },
};

async function play(req, res) {
    const rawUserId = authenticate(req, res, jwt);

    const gameId = storage.createOrJoinGame(rawUserId);

    return { gameId };
}

async function playAgainstAI(req, res) {
    const rawUserId = authenticate(req, res, jwt);

    const gameId = storage.createAIGame(rawUserId);

    return { gameId };
}

async function getOngoingGames(req, res) {
    const userId = authenticate(req, res, jwt);
    const params = getQueryParams(req);

    let ongoingGameId = storage.findGameByPlayerId(
        userId,
        params.get("gameMode"),
    );

    if (ongoingGameId) {
        logger.debug(`player is in game ${ongoingGameId}`);
    } else {
        logger.debug(`player is not in game`);
    }

    const game = storage.games.get(ongoingGameId);
    let notReady = null;

    if (game) notReady = !!game.challenge;

    // Because ongoingGameId is undefined, it doesn't even appear as a JSON key, because JS
    if (!ongoingGameId) ongoingGameId = null;

    return { ongoingGameId, notReady };
}

async function getOnlineCount(_req, _res) {
    return { count: storage.countClients() };
}

async function createChallenge(req, res) {
    const rawUserId = authenticate(req, res, jwt);
    const params = await decodeJsonBody(req);

    const userId = ObjectId.createFromHexString(rawUserId);

    if (!params.opponent) {
        sendError(res, 400, "E_MISSING_OPPONENT", "Missing opponent param");
        return;
    }

    const userCollection = pool.get().collection("users");
    const notifCollection = pool.get().collection("notifications");

    const challenger = await userCollection.findOne({ _id: userId });

    const opponent = await userCollection.findOne({
        _id: ObjectId.createFromHexString(params.opponent),
    });

    if (!opponent) {
        sendError(res, 404, "E_USER_NOT_FOUND", "Opponent not found");
        return;
    }

    const challengeId = storage.createChallenge(
        challenger._id.toString(),
        opponent._id.toString(),
    );

    await notifCollection.insertOne({
        recipient: opponent._id,
        type: "CHALLENGE",
        shouldDisplay: true,
        deferred: false,
        challenge: {
            challengeId,
            challengerUsername: challenger.username,
        },
    });

    return { ok: true };
}

async function acceptChallenge(req, res) {
    const userId = authenticate(req, res, jwt);
    const challengeId = getLastSegment(req);

    const challenge = storage.getChallenge(challengeId);

    if (!challenge) {
        sendError(res, 404, "E_NOT_FOUND", "Challenge not found");
        return;
    }

    if (userId !== challenge.opponent) {
        sendError(res, 400, "E_NOT_ALLOWED", "Not allowed to accept challenge");
        return;
    }

    if (challenge.accepted) {
        sendError(res, 400, "E_EXPIRED_CHALLENGE", "The challenge has expired");
        return;
    }

    if (!storage.isClientOutOfGame(challenge.challenger)) {
        sendError(res, 400, "E_EXPIRED_CHALLENGE", "The challenge has expired");
        return;
    }

    challenge.accepted = true;

    storage.createChallengeGame(challenge.challenger, challenge.opponent);

    const userCollection = pool.get().collection("users");
    const notifCollection = pool.get().collection("notifications");

    const opponent = await userCollection.findOne({
        _id: ObjectId.createFromHexString(challenge.opponent),
    });

    await notifCollection.insertOne({
        recipient: ObjectId.createFromHexString(challenge.challenger),
        type: "CHALLENGE_ACCEPTED",
        shouldDisplay: true,
        deferred: false,
        challengeAccepted: {
            opponentId: challenge.opponent,
            opponentUsername: opponent.username,
        },
    });

    return { ok: true };
}

module.exports = createHandler(endpoints, (res) => {
    res.statusCode = 404;
    res.end();
});
