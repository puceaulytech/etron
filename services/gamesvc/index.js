const http = require("http");
const { startGameLoop } = require("./gameloop");

const { Logger } = require("../helpers/logger");
const logger = new Logger("debug");

const handleRequest = require("./controllers");
const handleWS = require("./ws");

const PORT = 8002;

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

server.listen(PORT, () => logger.info(`listening on port ${PORT}`));
