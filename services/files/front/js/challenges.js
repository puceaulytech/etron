const challengeAcceptDialog = document.getElementById(
    "challenge-accept-dialog",
);
const challengeAcceptCancelBtn = document.getElementById(
    "challenge-accept-cancel",
);
const challengeAcceptBtn = document.getElementById("challenge-accept-button");

let challengeId;
let challengerUsername;

challengeAcceptCancelBtn.addEventListener("click", () => {
    challengeAcceptDialog.removeAttribute("show");
});

challengeAcceptBtn.addEventListener("click", () => {
    challengeAcceptDialog.removeAttribute("show");
    acceptChallenge();
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
}

async function acceptChallenge() {
    const resp = await authenticatedFetch(
        `/api/gamesvc/acceptchallenge/${challengeId}`,
        {
            method: "POST",
        },
    );

    if (resp.ok) {
        location.assign("/pages/online1v1.html");
    }
}

function challengeRequestClick() {
    challengeAcceptDialog.setAttribute(
        "content",
        `Accept ${challengerUsername}'s challenge?`,
    );
    challengeAcceptDialog.setAttribute("show", "yes");
}
