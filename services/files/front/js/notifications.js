socket.on("notification", (payload) => {
    if (payload.shouldDisplay) showNotification(payload);
});

function showNotification(notification) {
    const body = document.querySelector("body");

    let content;
    if (notification.type === "FRIEND_REQUEST") {
        const targetUsername = notification.friendRequest.targetUsername;

        content = `${targetUsername} wants to be your friend!`;
    }

    const notif = document.createElement("notification-card");
    notif.setAttribute("content", content);

    notif.addEventListener("close", () => {
        notif.remove();
    });

    body.appendChild(notif);
}

function fakeNotif() {
    showNotification({
        type: "FRIEND_REQUEST",
        friendRequest: {
            targetUsername: "romch007",
        },
    });
}
