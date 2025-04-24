let wsBaseUrl = "";

if (typeof Capacitor !== "undefined" && Capacitor.isNativePlatform()) {
    wsBaseUrl = `wss://etron.ps8.pns.academy/`;
}

const socket = io(wsBaseUrl, {
    transports: ["websocket"],
    auth: (cb) => {
        const accessToken = localStorage.getItem("accessToken");
        const ingame =
            location.pathname === "/pages/online1v1.html" ||
            location.pathname === "/pages/ai1v1.html";

        cb({ accessToken, ingame });
    },
});
