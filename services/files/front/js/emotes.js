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
    newEmote.classList.add("animated-emote");

    document.body.appendChild(newEmote);
    setTimeout(() => {
        newEmote.classList.add("disappearing-emote");
        setTimeout(() => newEmote.remove(), 450);
    }, 1800);
}

const emotes = ["😂", "😎", "😡", "😭", "💩"];

const container = document.getElementById("emote-container");

if (container) {
    emotes.forEach((emoteChar, index) => {
        const emoteItem = template.cloneNode(true);

        emoteItem.removeAttribute("id");

        emoteItem.querySelector(".emote").textContent = emoteChar;

        emoteItem.querySelector(".emote-number").textContent = index + 1;

        emoteItem.style.display = "flex";

        container.appendChild(emoteItem);
    });
}

socket.on("emote", (payload) => {
    displayEmote(payload.emote, true);
});

let lastEmoteTime = 0;
const EMOTE_COOLDOWN = 1000;

function sendEmote(index) {
    const now = Date.now();

    if (now - lastEmoteTime < EMOTE_COOLDOWN) return;

    lastEmoteTime = now;

    displayEmote(emotes[index], false);
    socket.emit("emote", {
        gameId,
        emote: emotes[index],
    });
}

document.addEventListener("keydown", (event) => {
    if (!gameId) return;

    let emoteIndex;
    switch (event.code) {
        case "Digit1":
            emoteIndex = 0;
            break;
        case "Digit2":
            emoteIndex = 1;
            break;
        case "Digit3":
            emoteIndex = 2;
            break;
        case "Digit4":
            emoteIndex = 3;
            break;
        case "Digit5":
            emoteIndex = 4;
            break;
        default:
            return;
    }
    event.preventDefault();

    sendEmote(emoteIndex);
});

const gamepadIndicators = [
    "xbox-y.svg",
    "xbox-x.svg",
    "xbox-b.svg",
    "xbox-a.svg",
    "xbox-rb.svg",
].map((n) => "/assets/" + n);

function switchToGamepadEmotes() {
    const indicators = Array.from(container.querySelectorAll(".emote-number"));

    for (let i = 0; i < indicators.length; i++) {
        if (i == 0) continue;

        const indicator = indicators[i];
        indicator.textContent = "";

        const icon = new Image(20, 20);
        icon.src = gamepadIndicators[i - 1];

        indicator.appendChild(icon);
    }
}

function switchToKeyboardEmotes() {
    const indicators = Array.from(container.querySelectorAll(".emote-number"));

    for (let i = 0; i < indicators.length; i++) {
        if (i == 0) continue;

        const indicator = indicators[i];
        indicator.textContent = i;
    }
}
