const http = require("http");

/**
 * Decodes the body of the request to JSON
 *
 * @param {http.ClientRequest} req The HTTP request
 * @returns {Promise<any>} The JSON body
 */
function decodeJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            try {
                const jsonData = JSON.parse(body);
                resolve(jsonData);
            } catch (err) {
                reject(new Error("Invalid JSON"));
            }
        });

        req.on("error", (err) => {
            reject(err);
        });
    });
}

module.exports = { decodeJsonBody };
