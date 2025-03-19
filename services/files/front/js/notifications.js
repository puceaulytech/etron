const onlineCountTxt = document.getElementById("online-count");

const NOTIF_TIMEOUT_S = 5;

const notifQueue = [];

socket.on("notification", (payload) => {
    if (payload.type === "USER_CONNECT") {
        updateOnlineCount();

        const userId = payload.connect.userId;
        setFriendOnlineStatus(userId, true);
    } else if (payload.type === "USER_DISCONNECT") {
        updateOnlineCount();

        const userId = payload.disconnect.userId;
        setFriendOnlineStatus(userId, false);
    }

    if (payload.shouldDisplay) {
        notifQueue.push(payload);

        if (notifQueue.length === 1) {
            // If the notification was the first one in the queue
            showNotification(payload);
        }
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

    const notifElem = document.createElement("notification-card");
    notifElem.setAttribute("content", content);

    setTimeout(() => {
        hideNotification(notifElem);
    }, NOTIF_TIMEOUT_S * 1000);

    notifElem.addEventListener("close", () => {
        hideNotification(notifElem);
    });

    notifElem.addEventListener("action", () => {
        if (notification.type === "FRIEND_REQUEST") {
            accountMenuSkipNext = true;
            showMenu();
            focusSectionByName("requests");
        } else if (notification.type === "FRIEND_REQUEST_ACCEPTED") {
            accountMenuSkipNext = true;
            showMenu();
            focusSectionByName("friends");
        }

        hideNotification(notifElem);
    });

    body.appendChild(notifElem);
}

async function updateOnlineCount() {
    const resp = await fetch("/api/gamesvc/onlinecount", {
        method: "GET",
    });
    const payload = await resp.json();

    onlineCountTxt.innerText = `${payload.count} player(s) online`;
}

function fakeNotif() {
    showNotification({
        type: "FRIEND_REQUEST",
        friendRequest: {
            targetUsername: "romch007",
        },
    });
}
