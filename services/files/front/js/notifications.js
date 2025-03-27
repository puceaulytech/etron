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
    } else if (payload.type === "CHAT_MESSAGE") {
        const message = payload.message;
        if (message.senderId === lastChatFriendId) {
            insertMessage(message.content, true);
            scrollToBottom();
        }
    } else if (payload.type === "CHALLENGE") {
        challengeId = payload.challenge.challengeId;
        challengerUsername = payload.challenge.challengerUsername;
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

function performNotifAction(notification, accountMenuWorkaround = true) {
    if (notification.type === "FRIEND_REQUEST") {
        if (accountMenuWorkaround) accountMenuSkipNext = true;

        showMenu();
        focusSectionByName("requests");
    } else if (notification.type === "FRIEND_REQUEST_ACCEPTED") {
        if (accountMenuWorkaround) accountMenuSkipNext = true;

        showMenu();
        focusSectionByName("friends");
    } else if (notification.type === "CHALLENGE") {
        challengeRequestClick();
    } else if (notification.type === "CHALLENGE_ACCEPTED") {
        location.assign("/pages/online1v1.html");
    }
}

function showNotification(notification) {
    const body = document.querySelector("body");

    let content;
    let icon;
    if (notification.type === "FRIEND_REQUEST") {
        const targetUsername = notification.friendRequest.targetUsername;

        icon = "/assets/account-plus-icon.svg";
        content = `${targetUsername} wants to be your friend!`;
        updateFriendRequests();
    } else if (notification.type === "FRIEND_REQUEST_ACCEPTED") {
        const targetUsername =
            notification.friendRequestAccepted.targetUsername;

        icon = "/assets/account-check-icon.svg";
        content = `${targetUsername} accepted your friend request!`;
        updateFriendRequests();
        updateFriendList();
    } else if (notification.type === "CHALLENGE") {
        const challengerUsername = notification.challenge.challengerUsername;

        icon = "/assets/fight-icon.svg";
        content = `${challengerUsername} is challenging you to a 1v1!`;
    } else if (notification.type === "CHALLENGE_ACCEPTED") {
        const opponentUsername =
            notification.challengeAccepted.opponentUsername;

        icon = "/assets/fight-icon.svg";
        content = `${opponentUsername} accepted your challenge!`;

        setTimeout(() => {
            location.assign("/pages/online1v1.html");
        }, 3000);
    }

    let systemNotif = null;

    if (localStorage.getItem("systemNotifications")) {
        systemNotif = new Notification("ETRON", {
            body: content,
            icon: "/favicon.png",
        });

        systemNotif.addEventListener("click", () => {
            performNotifAction(notification, false);
            hideNotification(notifElem);
        });

        systemNotif.addEventListener("close", () => {
            hideNotification(notifElem);
        });
    }

    const notifElem = document.createElement("notification-card");
    notifElem.setAttribute("content", content);
    if (icon) {
        notifElem.setAttribute("icon-src", icon);
    }

    setTimeout(() => {
        hideNotification(notifElem);
    }, NOTIF_TIMEOUT_S * 1000);

    notifElem.addEventListener("close", () => {
        if (systemNotif) systemNotif.close();

        hideNotification(notifElem);
    });

    notifElem.addEventListener("action", () => {
        performNotifAction(notification);
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

async function requestSystemNotifPermissions() {
    localStorage.setItem("systemNotifications", false);

    if (!("Notification" in window)) return;

    Notification.requestPermission().then((resp) => {
        localStorage.setItem("systemNotifications", resp === "granted");
    });
}

function fakeNotif() {
    showNotification({
        type: "FRIEND_REQUEST",
        friendRequest: {
            targetUsername: "romch007",
        },
    });
}
