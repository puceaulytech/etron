const chatOverlay = document.querySelector("#chat-section");
const chatBackButton = document.querySelector("#chat-header #chat-back-button");
const chatFriendNameContainer = document.querySelector(
    "#chat-header #friend-name",
);

const messagesContainer = document.querySelector("#chat-section #chat-itself");

const chatForm = document.querySelector("#chat-section #chat-input-container");
/** @type {HTMLInputElement} */
const chatMessageInput = document.querySelector(
    "#chat-input-container input[name='message']",
);

let lastChatFriendId;
let lastChatSubmitHandler;

async function sendChatTo(friendId, message) {
    await authenticatedFetch("/api/social/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: message,
            receiver: friendId,
        }),
    });
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function createMessageDiv(content, received, animated, italic = false) {
    const div = document.createElement("div");
    div.innerText = content;
    div.classList.add(
        "chat-message",
        received ? "received-message" : "sent-message",
    );
    if (italic) div.classList.add("italic");
    if (animated) {
        div.classList.add("animated");
        setTimeout(() => div.classList.remove("animated"), 160);
    }
    return div;
}

function createGameReportDiv(report) {
    const myUserId = localStorage.getItem("userId");
    const winning = report.winnerId === myUserId;
    const ourRounds = winning ? report.winnerRounds : report.loserRounds;
    const theirRounds = winning ? report.loserRounds : report.winnerRounds;

    const reportDiv = document.createElement("div");
    reportDiv.classList.add("game-report");

    const fightIcon = new Image();
    fightIcon.src = "/assets/fight-icon.svg";

    const titleDiv = document.createElement("div");
    titleDiv.classList.add("game-report-title");
    titleDiv.appendChild(fightIcon.cloneNode(false));
    titleDiv.appendChild(
        document.createTextNode(winning ? "Game won" : "Game lost"),
    );
    titleDiv.appendChild(fightIcon);

    const roundsDiv = document.createElement("div");
    roundsDiv.classList.add("game-report-rounds");

    const opponentRoundSpan = document.createElement("span");
    opponentRoundSpan.classList.add("game-report-round-red");
    opponentRoundSpan.textContent = theirRounds;

    const selfRoundSpan = document.createElement("span");
    selfRoundSpan.classList.add("game-report-round-green");
    selfRoundSpan.textContent = ourRounds;

    roundsDiv.appendChild(opponentRoundSpan);
    roundsDiv.appendChild(document.createTextNode("-"));
    roundsDiv.appendChild(selfRoundSpan);

    reportDiv.appendChild(titleDiv);
    reportDiv.appendChild(roundsDiv);

    return reportDiv;
}

function insertMessage(content, received, italic = false) {
    messagesContainer.appendChild(
        createMessageDiv(content, received, true, italic),
    );
}

async function updateMessages(friendId) {
    await authenticatedFetch(`/api/social/chat/${friendId}`, {
        method: "GET",
    })
        .then((messages) =>
            messages.map((message) =>
                message.gameReport
                    ? createGameReportDiv(message)
                    : createMessageDiv(
                          message.content,
                          friendId === message.sender,
                          false,
                          message.special && message.special === "CHALLENGE",
                      ),
            ),
        )
        .then((divs) => {
            messagesContainer.replaceChildren(...divs);
        });
}

async function acknowledgeConversation(friendId) {
    await authenticatedFetch(`/api/social/chat/${friendId}`, { method: "PUT" });
}

async function openChat(friendName, friendId) {
    if (friendId !== lastChatFriendId) {
        chatFriendNameContainer.innerText = friendName;
        chatMessageInput.setAttribute("placeholder", `Message ${friendName}`);
        chatMessageInput.value = "";

        const submitHandler = async (event) => {
            event.preventDefault();

            const message = chatMessageInput.value;
            if (message === "") return;

            insertMessage(message, false);
            scrollToBottom();
            chatMessageInput.value = "";
            await sendChatTo(friendId, message);
        };

        if (lastChatSubmitHandler)
            chatForm.removeEventListener("submit", lastChatSubmitHandler);
        chatForm.addEventListener("submit", submitHandler);
        lastChatSubmitHandler = submitHandler;
        lastChatFriendId = friendId;

        await updateMessages(friendId);
    } else {
        acknowledgeConversation(lastChatFriendId);
    }

    setUnreadStatus(friendId, false);

    chatOverlay.classList.remove("invisible");
    chatOverlay.style.display = "flex";
    chatOverlay.classList.add("visible");

    scrollToBottom();
}

function closeChat() {
    chatOverlay.classList.remove("visible");
    chatOverlay.classList.add("invisible");
    setTimeout(() => {
        chatOverlay.style.display = "none";
    }, 180);
}

chatBackButton.addEventListener("click", closeChat);
