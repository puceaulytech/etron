const pool = require("../helpers/db");

async function setEveryoneOffline() {
    const userCollection = pool.get().collection("users");

    await userCollection.updateMany({}, { $set: { online: false } });
}

module.exports = { setEveryoneOffline };
