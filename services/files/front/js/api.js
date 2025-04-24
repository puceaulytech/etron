let BASE_API = "";

if (typeof Capacitor !== "undefined" && Capacitor.isNativePlatform()) {
    BASE_API = "https://etron.ps8.pns.academy";
}

/**
 * Fetch api stuff
 *
 * @param {string} path
 * @param
 */
async function apiFetch(path, options) {
    const resp = await fetch(BASE_API + path, options);
    return resp;
}
