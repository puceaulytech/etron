const http = require("http");

const { Logger } = require("../helpers/logger");
const logger = new Logger("debug");
const pool = require("../helpers/db");

const handleRequest = require("./controllers");

const PORT = 8003;

const dbUrl = process.env["DB_URL"] ?? "127.0.0.1";
pool.setup(require("mongodb"), `mongodb://${dbUrl}`, "ps8");

const server = http.createServer((req, res) => {
    try {
        handleRequest(req, res);
    } catch (err) {
        logger.error(`internal server error: ${err}`);

        res.statusCode = 500;
        res.end("Internal Server Error");
    }
});

server.listen(PORT, "0.0.0.0", () => logger.info(`listening on port ${PORT}`));
