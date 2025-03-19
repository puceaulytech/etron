const chatOverlay = document.querySelector("#chat-section");
const backButton = document.querySelector("#chat-header #chat-back-button");
const friendNameContainer = document.querySelector("#chat-header #friend-name");
/** @type {HTMLInputElement} */
const messageInput = document.querySelector("#chat-input-container input");

let lastFriendId;

function scrollToBottom() {
    const messagesContainer = document.querySelector(
        "#chat-section #chat-itself",
    );
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function openChat(friendName, friendId) {
    if (friendId !== lastFriendId) {
        lastFriendId = friendId;
        friendNameContainer.innerHTML = friendName;
        messageInput.setAttribute("placeholder", `Message ${friendName}`);
        messageInput.value = "";

        // TODO: real messages
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
