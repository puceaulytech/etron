const {
    decodeJsonBody,
    decodeCookies,
    createHandler,
} = require("../helpers/http");

const endpoints = {
    login: {
        POST: login,
    },
};

async function login(req, res) {
    const payload = decodeJsonBody(req);
}

module.exports = createHandler(endpoints, (res) => {
    res.statusCode = 404;
    res.end();
});
