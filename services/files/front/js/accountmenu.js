/**
 * @param {string} message
 */
function displayLoginFormError(message) {
    const messageDiv = document.querySelector("#login-section #form-error");
    messageDiv.firstElementChild.textContent = message; // surely this will never cause nullptr exception
    messageDiv.classList.add("active");
}

const menu = document.querySelector("#account-menu");
const button = document.querySelector("#account-button");
let isToggled = false;

/**
 * @param {PointerEvent} event
 */
function clickOutsideOfMenu(event) {
    if (!menu.contains(event.target) && !button.contains(event.target))
        toggleMenu();
}

function toggleMenu() {
    menu.classList.toggle("visible");
    isToggled = !isToggled;
    if (isToggled) document.addEventListener("click", clickOutsideOfMenu);
    else document.removeEventListener("click", clickOutsideOfMenu);
}

button.addEventListener("click", toggleMenu);

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

document
    .querySelectorAll("#menu-header .section")
    .entries()
    .forEach((entry) => {
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
        const playerNameElement = document.querySelector(
            "#account-section #player-name",
        );
        playerNameElement.textContent = userInfo.username;
    });
}

currentSection = sectionBindings.keys().next().value;
if (localStorage.getItem("accessToken")) {
    loginSection.classList.remove("active");
    updateAccountInfo(); // async call with no await?
    updateFriendRequests();
}

selectNewSection(currentSection);

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
        await updateAccountInfo();
    });
}

async function registerUser() {
    const usernameInput = document.querySelector(
        "form.login-form input[name='username']",
    );
    const passwordInput = document.querySelector(
        "form.login-form input[name='password']",
    );
    await fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: usernameInput.value,
            password: passwordInput.value,
        }),
    }).then(async (response) => {
        if (!response.ok) return;

        await submitLogin(null);
    });
}

function logOut() {
    localStorage.clear();
    sectionBindings.get(currentSection).classList.remove("active");
    loginSection.classList.add("active");
}

const usernameInput = document.querySelector("#search-container input");
const searchResultsContainer = document.querySelector("#search-results");

function userSearchInput() {
    const input = usernameInput.value;
    if (input.length < 3) return;

    // Harmful injection possible?
    fetch(`/api/social/users?username=${input}`, {
        method: "GET",
    }).then(async (res) => {
        if (!res.ok) return;

        const users = await res.json();
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
        .catch(() => {
            friendRequests.innerHTML =
                "<p>Error while fetching friend requests!</p>";
        });
}
