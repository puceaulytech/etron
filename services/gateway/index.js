// The http module contains methods to handle http queries.
const http = require("http");
const httpProxy = require("http-proxy");

const microservices = { gamesvc: "http://127.0.0.1:8002" };
const websocketService = "ws://127.0.0.1:8002";

// We will need a proxy to send requests to the other services.
const proxy = httpProxy.createProxyServer();

const { Logger } = require("../helpers/logger");
const logger = new Logger("debug");

const PORT = 8000;

// Create a proxy for websockets

/* The http module contains a createServer function, which takes one argument, which is the function that
 ** will be called whenever a new request arrives to the server.
 */
const server = http.createServer(function (req, res) {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    const filePath = req.url.split("/").filter((elem) => elem !== "..");

    try {
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        if (filePath[1] === "api") {
            const target = microservices[filePath[2]];

            if (!target) {
                res.statusCode = 404;
                res.end();
                return;
            }

            proxy.web(req, res, { target });
        } else if (filePath[1] === "socket.io") {
            proxy.web(req, res, { target: microservices["gamesvc"] });
        } else {
            logger.debug(
                "request for a file received, transferring to the file service",
            );
            proxy.web(req, res, { target: "http://127.0.0.1:8001" });
        }
    } catch (error) {
        logger.warn(`error while processing ${req.url}: ${error}`);
        res.statusCode = 400;
        res.end(`Something in your request (${req.url}) is strange...`);
    }
    // For the server to be listening to request, it needs a port, which is set thanks to the listen function.
});

// Forward websocket upgrades
server.on("upgrade", (req, socket, head) => {
    proxy.ws(req, socket, head, { target: websocketService });
});

server.listen(PORT, () => logger.info(`listening on port ${PORT}`));
