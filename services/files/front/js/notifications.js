const NOTIF_TIMEOUT_S = 5;

const notifQueue = [];

socket.on("notification", (payload) => {
    notifQueue.push(payload);

    if (notifQueue.length === 1) {
        // If the notification was the first one in the queue
        if (payload.shouldDisplay) showNotification(payload);
    }
});

socket.emit("poll_notifs");

function hideNotification(htmlElem) {
    if (!htmlElem.isConnected) return;

    htmlElem.setAttribute("closing", "true");
    setTimeout(() => {
        htmlElem.remove();
        notifQueue.shift();
        if (notifQueue.length > 0) showNotification(notifQueue[0]);
    }, 1100);
}

function showNotification(notification) {
    const body = document.querySelector("body");

    let content;
    if (notification.type === "FRIEND_REQUEST") {
        const targetUsername = notification.friendRequest.targetUsername;

        content = `${targetUsername} wants to be your friend!`;
        updateFriendRequests();
    } else if (notification.type === "FRIEND_REQUEST_ACCEPTED") {
        const targetUsername =
            notification.friendRequestAccepted.targetUsername;

        content = `${targetUsername} accepted your friend request!`;
        updateFriendRequests();
        updateFriendList();
    }

    const notif = document.createElement("notification-card");
    notif.setAttribute("content", content);

    setTimeout(() => {
        hideNotification(notif);
    }, NOTIF_TIMEOUT_S * 1000);

    notif.addEventListener("close", () => {
        hideNotification(notif);
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
