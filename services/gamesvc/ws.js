const { Server } = require("socket.io");

function handleWS(httpServer) {
    const io = new Server(httpServer, {});

    // FIXME: this stores socket ids, which is volatile
    // and may not be suitable for tracking connected clients
    const connectedClients = [];

    io.on("connection", (socket) => {
        connectedClients.push(socket.id);

        // Register disconnection event
        socket.on("disconnect", (_reason) => {
            const idx = connectedClients.indexOf(socket.id);
            if (idx !== -1) connectedClients.splice(idx, 1);
        });
    });
}

module.exports = handleWS;
