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
    // Questionable edge case handling
    if (!localStorage.getItem("accessToken"))
        throw new Error(
            "Could not update account info, no access token in localStorage",
        );

    await fetch("/api/auth/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    }).then(async (response) => {
        if (!response.ok) return; // TODO: something better

        const userInfo = await response.json();
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
}

selectNewSection(currentSection);

/**
 * @param {SubmitEvent} event
 */
async function submitLogin(event) {
    event.preventDefault();
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
        if (!response.ok) return;

        usernameInput.value = "";
        const tokens = await response.json();
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        selectNewSection(currentSection);
        loginSection.classList.remove("active");
        await updateAccountInfo();
    });
}

function logOut() {
    localStorage.clear();
    sectionBindings.get(currentSection).classList.remove("active");
    loginSection.classList.add("active");
}
