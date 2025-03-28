const playOnlineButton = document.getElementById("play-online-btn");
const playAIButton = document.getElementById("play-ai-btn");
const playLocalButton = document.getElementById("play-local-btn");
const quitButton = document.getElementById("quit-btn");

function mainMenuPlay(mode) {
    let url;

    const isLoggedIn = localStorage.getItem("accessToken") !== null;

    switch (mode) {
        case "online":
            if (!isLoggedIn) {
                accountMenuSkipNext = true;
                showMenu();
                return;
            }
            url = "pages/online1v1.html";
            break;
        case "ai":
            if (!isLoggedIn) {
                accountMenuSkipNext = true;
                showMenu();
                return;
            }
            url = "pages/ai1v1.html";
            break;
        case "local":
            url = "pages/local1v1.html";
            break;
    }

    location.assign(url);
}

playOnlineButton.addEventListener("click", () => {
    mainMenuPlay("online");
});

playAIButton.addEventListener("click", () => {
    mainMenuPlay("ai");
});

playLocalButton.addEventListener("click", () => {
    mainMenuPlay("local");
});

const tutorialDialog = document.querySelector("#tutorial-dialog");
const tutorialButton = document.querySelector("#tutorial-btn");
const tutorialCloseButton = document.querySelector("#tutorial-close");

tutorialButton.addEventListener("click", () =>
    tutorialDialog.setAttribute("show", "YEAH"),
);

tutorialCloseButton.addEventListener("click", () =>
    tutorialDialog.removeAttribute("show"),
);

quitButton.addEventListener("click", () => {
    location.replace("/assets/bob.png");
});
