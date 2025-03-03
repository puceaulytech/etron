const gameModeSelect = document.getElementById("game-mode");
const playButton = document.getElementById("play-btn");

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
