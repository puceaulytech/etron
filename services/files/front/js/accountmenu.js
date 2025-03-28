// TODO: clean this mess?

/**
 * @param {string} message
 */
function displayLoginFormError(message) {
    const messageDiv = document.querySelector("#login-section #form-error");
    messageDiv.firstElementChild.textContent = message; // surely this will never cause nullptr exception
    messageDiv.classList.add("active");
}

const accountMenu = document.querySelector("#account-menu");
const accountButton = document.querySelector("#account-button");
let isToggled = false;
let accountMenuSkipNext = false;

/**
 * @param {PointerEvent} event
 */
function clickOutsideOfMenu(event) {
    if (accountMenuSkipNext) {
        accountMenuSkipNext = false;
        return;
    }

    if (
        !accountMenu.contains(event.target) &&
        !accountButton.contains(event.target)
    ) {
        toggleMenu();
        resetSearchInput();
    }
}

function showMenu() {
    accountMenu.classList.add("visible");
    isToggled = true;
    document.addEventListener("click", clickOutsideOfMenu);
}

function toggleMenu() {
    accountMenu.classList.toggle("visible");
    isToggled = !isToggled;
    if (isToggled) document.addEventListener("click", clickOutsideOfMenu);
    else document.removeEventListener("click", clickOutsideOfMenu);
}

accountButton.addEventListener("click", toggleMenu);

/** @type {Map<HTMLDivElement, HTMLDivElement>} */
const sectionBindings = new Map();
const loginSection = document.querySelector("#login-section");
// TODO: add some more styling to the two functions bellow
/**
 * @param {HTMLDivElement} newSection
 */
function selectNewSection(newSection) {
    newSection.style.fontWeight = "bolder";

    if (!localStorage.getItem("accessToken"))
        loginSection.classList.add("active");
    else sectionBindings.get(newSection).classList.add("active");
}
/**
 * @param {HTMLDivElement} oldSection
 */
function unselectOldSection(oldSection) {
    oldSection.style.fontWeight = "normal";
    sectionBindings.get(oldSection).classList.remove("active");
}

let currentSection;
const contentSections = document.querySelectorAll(
    "#menu-content .content-section",
);

Array.from(
    document.querySelectorAll("#menu-header .section").entries(),
).forEach((entry) => {
    const section = entry[1];
    sectionBindings.set(section, contentSections[entry[0]]);
    section.addEventListener("click", () => {
        if (section === currentSection) return;
        selectNewSection(section);
        unselectOldSection(currentSection);
        currentSection = section;
    });
});

async function updateAccountInfo() {
    await authenticatedFetch("/api/auth/me", {
        method: "GET",
    }).then(async (userInfo) => {
        localStorage.setItem("userId", userInfo._id);

        const playerNameElement = document.querySelector(
            "#account-section #player-name",
        );
        playerNameElement.textContent = userInfo.username;

        const accountDateElement = document.querySelector(
            "#account-section #account-creation-date",
        );
        const accountCreationDate = new Date(parseInt(userInfo.createdAt));
        const formattedDate = accountCreationDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        accountDateElement.textContent = `Member since: ${formattedDate}`;

        const playerEloElement = document.querySelector(
            "#account-section #player-elo",
        );
        playerEloElement.textContent = `ELO: ${Math.floor(userInfo.elo)}`;

        const gamesPlayed = userInfo.gameHistory.length;
        const playerGamesPlayedElement = document.querySelector(
            "#account-section #player-games-played",
        );
        playerGamesPlayedElement.textContent = `${gamesPlayed}`;

        const gamesWon =
            gamesPlayed === 0
                ? 0
                : userInfo.gameHistory.filter(
                      (game) => game.winner === userInfo._id,
                  ).length;
        const playerGamesWonElement = document.querySelector(
            "#account-section #player-games-won",
        );
        playerGamesWonElement.textContent = `${gamesWon}`;

        const playerWinRateElement = document.querySelector(
            "#account-section #player-win-rate",
        );
        const winRateString =
            gamesPlayed === 0
                ? "N/A"
                : `${Math.round((100 * gamesWon) / gamesPlayed)} %`;
        playerWinRateElement.textContent = `${winRateString}`;
    });
}

currentSection = sectionBindings.keys().next().value;
if (localStorage.getItem("accessToken")) {
    loginSection.classList.remove("active");
    updateAll(); // async call with no await?
}

selectNewSection(currentSection);

function focusSectionByName(sectionName) {
    const sections = document.querySelectorAll("#menu-header .section");

    for (const section of sections) {
        if (section.getAttribute("name") === sectionName) {
            if (section === currentSection) return;
            selectNewSection(section);
            unselectOldSection(currentSection);
            currentSection = section;
        }
    }
}

const passwordToggle = document.querySelector("#password-toggle");
passwordToggle.addEventListener("click", () => {
    const passwordInput = document.querySelector(
        "form.login-form input[name='password']",
    );
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordToggle.classList.add("always-visible");
    } else {
        passwordInput.type = "password";
        passwordToggle.classList.remove("always-visible");
    }
});

/**
 * @param {SubmitEvent} event
 */
async function submitLogin(event) {
    if (event) event.preventDefault();
    const usernameInput = document.querySelector(
        "form.login-form input[name='username']",
    );
    const passwordInput = document.querySelector(
        "form.login-form input[name='password']",
    );
    await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: usernameInput.value,
            password: passwordInput.value,
        }),
    }).then(async (response) => {
        passwordInput.value = "";
        if (!response.ok) {
            displayLoginFormError("Incorrect username or password.");
            return;
        }

        usernameInput.value = "";
        const tokens = await response.json();
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        selectNewSection(currentSection);
        loginSection.classList.remove("active");
        await updateAll();
        await requestSystemNotifPermissions();

        socket.connect();
    });
}

async function registerUser() {
    const emptyFieldErrorMsg = "Missing username or password!";

    const usernameInput = document.querySelector(
        "form.login-form input[name='username']",
    );
    const passwordInput = document.querySelector(
        "form.login-form input[name='password']",
    );

    const username = usernameInput.value;
    const password = passwordInput.value;
    if (username === "" || password === "") {
        displayLoginFormError(emptyFieldErrorMsg);
        return;
    }

    await fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    }).then(async (response) => {
        if (!response.ok) {
            const message = (await response.json()).message;
            displayLoginFormError(
                message ?? "Unexpected error while registering",
            );
            return;
        }

        await submitLogin(null);
        updateLeaderboard();
    });
}

function logOut() {
    localStorage.clear();
    sectionBindings.get(currentSection).classList.remove("active");
    loginSection.classList.add("active");
    socket.disconnect();
}

const usernameInput = document.querySelector("#search-container input");
const searchResultsContainer = document.querySelector("#search-results");

function userSearchInput() {
    const input = usernameInput.value;

    if (input.length < 3) {
        searchResultsContainer.innerHTML = "";
        return;
    }

    // Harmful injection possible?
    authenticatedFetch(`/api/social/searchuser?username=${input}`, {
        method: "GET",
    }).then(async (users) => {
        searchResultsContainer.replaceChildren(
            ...users.map((user) => {
                const elem = new SearchResult();
                elem.setAttribute("user-id", user._id);
                elem.setAttribute("username", user.username);
                return elem;
            }),
        );
    });
}

function resetSearchInput() {
    usernameInput.value = "";
}

const friendList = document.querySelector("#friend-list");

function setFriendChallengeFeedback(userId) {
    for (const friendElem of friendList.children) {
        if (friendElem.getAttribute("user-id") === userId) {
            friendElem.setAttribute("challenge-feedback", "yes");

            setTimeout(() => {
                friendElem.removeAttribute("challenge-feedback");
            }, 2000);
        }
    }
}

function setFriendOnlineStatus(userId, isOnline) {
    for (const friendElem of friendList.children) {
        if (friendElem.getAttribute("user-id") === userId) {
            if (isOnline) friendElem.setAttribute("online", "yes");
            else friendElem.removeAttribute("online");
        }
    }
}

function setUnreadStatus(userId, unread) {
    for (const friendElem of friendList.children) {
        if (friendElem.getAttribute("user-id") === userId) {
            if (unread) friendElem.setAttribute("unread-msg", "yes");
            else friendElem.removeAttribute("unread-msg");
        }
    }
}

async function updateFriendList() {
    authenticatedFetch("/api/social/friends", {
        method: "GET",
    })
        .then(async (friends) => {
            if (friends.length === 0) {
                friendList.innerHTML =
                    "<p>No friends, it happens sometimes</p>";
                return;
            }

            friendList.replaceChildren(
                ...friends.map((user) => {
                    const elem = new FriendItem();
                    elem.setAttribute("user-id", user._id);
                    elem.setAttribute("user-elo", user.elo);
                    elem.setAttribute("username", user.username);

                    if (user.online) {
                        elem.setAttribute("online", "yes");
                    }

                    if (user.unreadMsgCount > 0) {
                        elem.setAttribute("unread-msg", "yes");
                    }

                    return elem;
                }),
            );
        })
        .catch((e) => {
            console.error(e);
            friendList.innerHTML = "<p>Error while fetching friend list!</p>";
        });
}

const friendRequests = document.querySelector("#requests-section div");

async function updateFriendRequests() {
    authenticatedFetch("/api/social/friendrequests", {
        method: "GET",
    })
        .then(async (users) => {
            if (users.length === 0) {
                friendRequests.innerHTML =
                    "<p>No friend requests, try having some Curly's</p>";
                return;
            }

            friendRequests.replaceChildren(
                ...users.map((user) => {
                    const elem = new FriendRequest();
                    elem.setAttribute("user-id", user._id);
                    elem.setAttribute("username", user.username);
                    return elem;
                }),
            );
        })
        .catch((e) => {
            console.error(e);
            friendRequests.innerHTML =
                "<p>Error while fetching friend requests!</p>";
        });
}

async function updateAll() {
    const promises = [
        updateAccountInfo(),
        updateFriendList(),
        updateFriendRequests(),
    ];
    await Promise.all(promises);
}

document.addEventListener("rejectFriendRequest", (event) => {
    // TODO: better feedback for UX (pop up?)
    authenticatedFetch(`/api/social/friendrequests/${event.detail.userId}`, {
        method: "DELETE",
    }).then(async () => {
        await updateFriendRequests();
    });
});

document.addEventListener("acceptFriendRequest", (event) => {
    // TODO: better feedback for UX (pop up?)
    authenticatedFetch("/api/social/friendrequests", {
        method: "POST",
        body: JSON.stringify({
            newFriendId: event.detail.userId,
        }),
    }).then(async () => {
        await updateFriendRequests();
        await updateFriendList();
    });
});
