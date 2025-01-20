const http = require("http");

const { Logger } = require("../helpers/logger");
const logger = new Logger("debug");

const handleRequest = require("./controllers");

const PORT = 8002;

http.createServer((req, res) => {
    try {
        handleRequest(req, res);
    } catch (err) {
        logger.error(`internal server error: ${err}`);

        res.statusCode = 500;
        res.end("Internal Server Error");
    }
}).listen(PORT, () => logger.info(`listening on port ${PORT}`));
