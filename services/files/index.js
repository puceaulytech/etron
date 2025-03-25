const http = require("http");

const { Logger } = require("../helpers/logger");
const logger = new Logger("debug");

const fileQuery = require("./logic.js");

const PORT = 8001;

http.createServer(function (request, response) {
    fileQuery.manage(request, response);
    // For the server to be listening to request, it needs a port, which is set thanks to the listen function.
}).listen(PORT, "0.0.0.0", () => logger.info(`listening on port ${PORT}`));
