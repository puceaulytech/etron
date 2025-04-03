const challengeAcceptDialog = document.getElementById(
    "challenge-accept-dialog",
);
const challengeAcceptCancelBtn = document.getElementById(
    "challenge-accept-cancel",
);
const challengeAcceptBtn = document.getElementById("challenge-accept-button");

const challengeErrorDialog = document.getElementById("challenge-error-dialog");
const challengeErrorCloseBtn = document.getElementById("challenge-error-close");

let challengeId;
let challengerUsername;

challengeAcceptCancelBtn.addEventListener("click", () => {
    challengeAcceptDialog.removeAttribute("show");
});

challengeAcceptBtn.addEventListener("click", () => {
    challengeAcceptDialog.removeAttribute("show");
    acceptChallenge();
});

challengeErrorCloseBtn.addEventListener("click", () => {
    challengeErrorDialog.removeAttribute("show");
});

async function challengeFriend(friendId) {
    await authenticatedFetch("/api/gamesvc/challenges", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ opponent: friendId }),
    });

    setFriendChallengeFeedback(friendId);

    if (friendId === lastChatFriendId) {
        insertMessage("Challenge sent", false, true);
        scrollToBottom();
    }
}

async function acceptChallenge() {
    try {
        const resp = await authenticatedFetch(
            `/api/gamesvc/acceptchallenge/${challengeId}`,
            {
                method: "POST",
            },
        );

        location.assign("/pages/online1v1.html");
    } catch (err) {
        if (err.code === "E_EXPIRED_CHALLENGE") {
            challengeErrorDialog.setAttribute(
                "content",
                "The challenge has expired",
            );
            challengeErrorDialog.setAttribute("show", "yes");
        } else {
            throw err;
        }
    }
}

function challengeRequestClick() {
    challengeAcceptDialog.setAttribute(
        "content",
        `Accept ${challengerUsername}'s challenge?`,
    );
    challengeAcceptDialog.setAttribute("show", "yes");
}
