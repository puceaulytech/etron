const pool = require("../helpers/db");

const BOT_USERNAME = process.env["BOT_USERNAME"];

async function setEveryoneOffline() {
    const userCollection = pool.get().collection("users");

    await userCollection.updateMany(
        { username: { $ne: BOT_USERNAME } },
        { $set: { online: false } },
    );
}

module.exports = { setEveryoneOffline };
