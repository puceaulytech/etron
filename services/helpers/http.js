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

const cookieNameRegexp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
const cookieValueRegexp = /^[\u0021-\u003A\u003C-\u007E]*$/;

function startIndex(str, index, max) {
    do {
        const code = str.charCodeAt(index);
        if (code !== 0x20 /*   */ && code !== 0x09 /* \t */) return index;
    } while (++index < max);
    return max;
}

function endIndex(str, index, min) {
    while (index > min) {
        const code = str.charCodeAt(--index);
        if (code !== 0x20 /*   */ && code !== 0x09 /* \t */) return index + 1;
    }
    return min;
}

function decodeCookieValue(str) {
    if (str.indexOf("%") === -1) return str;

    try {
        return decodeURIComponent(str);
    } catch (e) {
        return str;
    }
}

/**
 * Decodes a Cookies header
 *
 * @param {string} cookiesHeader The header content
 * @returns {Record<string, string | undefined>} The decoded content
 */
function decodeCookies(cookiesHeader) {
    const decoded = {};

    if (cookiesHeader.length < 2) return decoded;

    let index = 0;

    do {
        const eqIdx = cookiesHeader.indexOf("=", index);
        if (eqIdx === -1) break;

        const colonIdx = cookiesHeader.indexOf(";", index);
        const endIdx = colonIdx === -1 ? cookiesHeader.length : colonIdx;

        if (eqIdx > endIdx) {
            index = cookiesHeader.lastIndexOf(";", eqIdx - 1) + 1;
            continue;
        }

        const keyStartIdx = startIndex(cookiesHeader, index, eqIdx);
        const keyEndIdx = endIndex(cookiesHeader, eqIdx, keyStartIdx);
        const key = cookiesHeader.slice(keyStartIdx, keyEndIdx);

        if (decoded[key] === undefined) {
            let valStartIdx = startIndex(cookiesHeader, eqIdx + 1, endIdx);
            let valEndIdx = endIndex(cookiesHeader, endIdx, valStartIdx);

            const value = decodeCookieValue(
                cookiesHeader.slice(valStartIdx, valEndIdx),
            );
            decoded[key] = value;
        }

        index = endIdx + 1;
    } while (index < cookiesHeader.length);

    return decoded;
}

/**
 * Encodes a object into a Set-Cookie header
 *
 * @param {Record<string, string>} cookies The cookies
 * @returns {string} The Set-Cookie header
 */
function encodeCookies(cookies) {
    return Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
}

module.exports = { decodeJsonBody, decodeCookies, encodeCookies };
