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

const tutorialBody = document.getElementById("tutorial-body");
const tutorialPages = document.querySelector(".tutorial-pages");
const prevButton = document.getElementById("prev-page");
const nextButton = document.getElementById("next-page");
let currentPage = 0;

function tutorialNextPage() {
    if (currentPage < 1) {
        currentPage++;
        tutorialPages.style.transform = "translateX(-50%)";
        prevButton.disabled = false;
        nextButton.disabled = true;
    }
}

function tutorialPreviousPage() {
    if (currentPage > 0) {
        currentPage--;
        tutorialPages.style.transform = "translateX(0)";
        prevButton.disabled = true;
        nextButton.disabled = false;
    }
}

document.addEventListener("keydown", (e) => {
    if (!tutorialDialog.hasAttribute("show")) return;

    if (e.key === "ArrowRight") {
        tutorialNextPage();
    } else if (e.key === "ArrowLeft") {
        tutorialPreviousPage();
    }
});

nextButton.addEventListener("click", () => {
    tutorialNextPage();
});

prevButton.addEventListener("click", () => {
    tutorialPreviousPage();
});

socket.on("connect", () => {
    updateOnlineCount();
});

window.addEventListener(
    "pageshow",
    async (event) => {
        if (
            event.persisted ||
            performance.getEntriesByType("navigation")[0].type ===
                "back_forward"
        ) {
            // Reload some stuff because the page was loaded from cache
            await updateAll();
            await updateOnlineCount();
            if (lastChatFriendId) await updateMessages(lastChatFriendId);
        }
    },
    false,
);
