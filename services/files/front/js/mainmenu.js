const gameModeSelect = document.getElementById("game-mode");
const playButton = document.getElementById("play-btn");
const quitButton = document.getElementById("quit-btn");

playButton.addEventListener("click", () => {
    let url;

    const isLoggedIn = localStorage.getItem("accessToken") !== null;

    switch (gameModeSelect.value) {
        case "online":
            if (!isLoggedIn) {
                accountMenuSkipNext = true;
                toggleMenu();
                return;
            }
            url = "pages/online1v1.html";
            break;
        case "ai":
            if (!isLoggedIn) {
                accountMenuSkipNext = true;
                toggleMenu();
                return;
            }
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
