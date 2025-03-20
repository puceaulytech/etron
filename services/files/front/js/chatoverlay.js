const chatOverlay = document.querySelector("#chat-section");
const backButton = document.querySelector("#chat-header #chat-back-button");
const friendNameContainer = document.querySelector("#chat-header #friend-name");

const messagesContainer = document.querySelector("#chat-section #chat-itself");

const chatForm = document.querySelector("#chat-section #chat-input-container");
/** @type {HTMLInputElement} */
const messageInput = document.querySelector(
    "#chat-input-container input[name='message']",
);

let lastFriendId;
let lastSubmitHandler;

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

async function openChat(friendName, friendId) {
    if (friendId !== lastFriendId) {
        friendNameContainer.innerHTML = friendName;
        messageInput.setAttribute("placeholder", `Message ${friendName}`);
        messageInput.value = "";

        const submitHandler = async (event) => {
            event.preventDefault();

            const message = messageInput.value;
            if (message === "") return;

            await sendChatTo(friendId, message);
            scrollToBottom();
            messageInput.value = "";
        };

        if (lastSubmitHandler)
            chatForm.removeEventListener("submit", lastSubmitHandler);
        chatForm.addEventListener("submit", submitHandler);
        lastSubmitHandler = submitHandler;
        lastFriendId = friendId;

        await authenticatedFetch(`/api/social/chat/${friendId}`, {
            method: "GET",
        })
            .then((messages) =>
                messages.map((message) => {
                    const div = document.createElement("div");
                    div.innerText = message.content;
                    div.classList.add(
                        "chat-message",
                        friendId === message.sender
                            ? "received-message"
                            : "sent-message",
                    );
                    return div;
                }),
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

backButton.addEventListener("click", closeChat);
