const template = document.getElementById("emote-template");

function displayEmote(emoteChar, isFromOpponent) {
    const newEmote = template
        .querySelector(".dialogue-container")
        .cloneNode(true);
    newEmote.querySelector(".emote").textContent = emoteChar;
    newEmote.style.position = "absolute";
    newEmote.style.top = "50%";
    if (isFromOpponent) {
        newEmote.style.right = "15%";
        newEmote.style["border-radius"] = "15px 15px 15px 0";
    } else {
        newEmote.style.left = "15%";
    }

    document.body.appendChild(newEmote);
    setTimeout(() => newEmote.remove(), 2000);
}

const emotes = ["😂", "😎", "😡", "😭", "💩"];

const container = document.getElementById("emote-container");

emotes.forEach((emoteChar, index) => {
    const emoteItem = template.cloneNode(true);

    emoteItem.removeAttribute("id");

    emoteItem.querySelector(".emote").textContent = emoteChar;

    emoteItem.querySelector(".emote-number").textContent = index + 1;

    emoteItem.style.display = "flex";

    container.appendChild(emoteItem);
});

socket.on("emote", (payload) => {
    displayEmote(payload.emote, true);
});

document.addEventListener("keydown", (event) => {
    if (!gameId) return;

    let emoteToSend;
    switch (event.code) {
        case "Digit1":
            emoteToSend = emotes[0];
            break;
        case "Digit2":
            emoteToSend = emotes[1];
            break;
        case "Digit3":
            emoteToSend = emotes[2];
            break;
        case "Digit4":
            emoteToSend = emotes[3];
            break;
        case "Digit5":
            emoteToSend = emotes[4];
            break;
        default:
            return;
    }
    event.preventDefault();

    displayEmote(emoteToSend, false);
    socket.emit("emote", {
        gameId,
        emote: emoteToSend,
    });
});
