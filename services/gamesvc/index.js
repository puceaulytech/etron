const http = require("http");
const pool = require("../helpers/db");
const { startGameLoop } = require("./gameloop");

const { Logger } = require("../helpers/logger");
const logger = new Logger("debug");

const handleRequest = require("./controllers");
const handleWS = require("./ws");

const PORT = 8002;

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

const io = handleWS(server);

startGameLoop(io);

server.listen(PORT, "0.0.0.0", () => logger.info(`listening on port ${PORT}`));
