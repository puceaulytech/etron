class Pool {
    /**
     * Setups the thingy
     *
     * @param {string} url
     * @param {string} databaseName
     */
    static setup(mongodb, url, databaseName) {
        const { MongoClient } = mongodb;

        this.client = new MongoClient(url);
        this.db = this.client.db(databaseName);
    }

    /**
     * @returns {Db}
     */
    static get() {
        if (!this.client)
            throw new Error("MongoDB connection was not initialized");

        return this.db;
    }
}

module.exports = Pool;
