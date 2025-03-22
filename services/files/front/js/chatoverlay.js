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

function createMessageDiv(content, received) {
    const div = document.createElement("div");
    div.innerText = content;
    div.classList.add(
        "chat-message",
        received ? "received-message" : "sent-message",
    );
    return div;
}

function insertMessage(content, received) {
    messagesContainer.appendChild(createMessageDiv(content, received));
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

        await authenticatedFetch(`/api/social/chat/${friendId}`, {
            method: "GET",
        })
            .then((messages) =>
                messages.map((message) =>
                    createMessageDiv(
                        message.content,
                        friendId === message.sender,
                    ),
                ),
            )
            .then((divs) => {
                messagesContainer.replaceChildren(...divs);
            });
    }

    chatOverlay.classList.remove("invisible");
    chatOverlay.classList.add("visible");

    scrollToBottom();
}

function closeChat() {
    chatOverlay.classList.remove("visible");
    chatOverlay.classList.add("invisible");
}

chatBackButton.addEventListener("click", closeChat);
