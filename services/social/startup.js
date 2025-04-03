const pool = require("../helpers/db");

const BOT_USERNAME = "Âne Trotro";

async function createAneTrotro() {
    const userCollection = pool.get().collection("users");

    const existingBot = await userCollection.findOne({
        username: BOT_USERNAME,
    });
    if (existingBot) return;

    await userCollection.insertOne({
        username: BOT_USERNAME,
        online: true,
    });
}

module.exports = { createAneTrotro, BOT_USERNAME };
