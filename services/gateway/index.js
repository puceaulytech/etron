// The http module contains methods to handle http queries.
const http = require("http");
const httpProxy = require("http-proxy");

// We will need a proxy to send requests to the other services.
const proxy = httpProxy.createProxyServer();

const { Logger } = require("../helpers/logger");
const logger = new Logger("debug");

const PORT = 8000;

/* The http module contains a createServer function, which takes one argument, which is the function that
 ** will be called whenever a new request arrives to the server.
 */
http.createServer(function (request, response) {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    let filePath = request.url.split("/").filter(function (elem) {
        return elem !== "..";
    });

    try {
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        if (filePath[1] === "api") {
            //TODO: Add middlewares and call microservices depending on the request.
            // If it doesn't start by /api, then it's a request for a file.
        } else {
            logger.debug(
                "request for a file received, transferring to the file service",
            );
            proxy.web(request, response, { target: "http://127.0.0.1:8001" });
        }
    } catch (error) {
        logger.warn(`error while processing ${request.url}: ${error}`);
        response.statusCode = 400;
        response.end(
            `Something in your request (${request.url}) is strange...`,
        );
    }
    // For the server to be listening to request, it needs a port, which is set thanks to the listen function.
}).listen(PORT, () => logger.info(`listening on port ${PORT}`));
