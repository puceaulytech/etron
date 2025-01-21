const { Server } = require("socket.io");
const storage = require("./storage");

function handleWS(httpServer) {
    const io = new Server(httpServer, {});

    io.on("connection", (socket) => {
        storage.addClient(socket.id);

        // Register disconnection event
        socket.on("disconnect", (_reason) => {
            storage.removeClient(socket.id);
        });
    });
}

module.exports = handleWS;
