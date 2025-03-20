const chatOverlay = document.querySelector("#chat-section");
const backButton = document.querySelector("#chat-header #chat-back-button");
const friendNameContainer = document.querySelector("#chat-header #friend-name");
const messagesContainer = document.querySelector("#chat-section #chat-itself");
/** @type {HTMLInputElement} */
const messageInput = document.querySelector("#chat-input-container input");

let lastFriendId;

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function openChat(friendName, friendId) {
    if (friendId !== lastFriendId) {
        lastFriendId = friendId;
        friendNameContainer.innerHTML = friendName;
        messageInput.setAttribute("placeholder", `Message ${friendName}`);
        messageInput.value = "";

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
