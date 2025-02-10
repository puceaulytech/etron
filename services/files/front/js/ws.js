const socket = io({
    transports: ["websocket"],
    auth: (cb) => {
        const accessToken = localStorage.getItem("accessToken");

        cb({ accessToken });
    },
});
