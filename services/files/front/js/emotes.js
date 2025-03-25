document.addEventListener("DOMContentLoaded", () => {
    const emotes = ["😂", "😎", "😡", "😭", "💩"];

    const template = document.getElementById("emote-template");
    const container = document.getElementById("emote-container");

    emotes.forEach((emoteChar, index) => {
        const emoteItem = template.cloneNode(true);

        emoteItem.removeAttribute("id");

        emoteItem.querySelector(".emote").textContent = emoteChar;

        emoteItem.querySelector(".emote-number").textContent = index + 1;

        emoteItem.style.display = "flex";

        container.appendChild(emoteItem);
    });
});
