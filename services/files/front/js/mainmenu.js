const gameModeSelect = document.getElementById("game-mode");
const playButton = document.getElementById("play-btn");
const quitButton = document.getElementById("quit-btn");

playButton.addEventListener("click", () => {
    let url;

    switch (gameModeSelect.value) {
        case "online":
            break;
        case "ai":
            url = "pages/ai1v1.html";
            break;
        case "local":
            url = "pages/local1v1.html";
            break;
    }

    location.assign(url);
});

quitButton.addEventListener("click", () => {
    location.replace("/assets/bob.png");
});
