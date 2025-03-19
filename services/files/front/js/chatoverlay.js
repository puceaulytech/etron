const chatOverlay = document.querySelector("#chat-section");
const backButton = document.querySelector("#chat-header #chat-back-button");
const friendNameContainer = document.querySelector("#chat-header #friend-name");
/** @type {HTMLInputElement} */
const messageInput = document.querySelector("#chat-input-container input");

let lastFriendId;

function openChat(friendName, friendId) {
    if (friendId !== lastFriendId) {
        lastFriendId = friendId;
        friendNameContainer.innerHTML = friendName;
        messageInput.setAttribute("placeholder", `Message ${friendName}`);
        messageInput.value = "";
    }

    chatOverlay.classList.remove("invisible");
    chatOverlay.classList.add("visible");
}

function closeChat() {
    chatOverlay.classList.remove("visible");
    chatOverlay.classList.add("invisible");
}

backButton.addEventListener("click", closeChat);
