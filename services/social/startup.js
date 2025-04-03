const pool = require("../helpers/db");

const BOT_USERNAME = process.env["BOT_USERNAME"];

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

module.exports = { createAneTrotro };
