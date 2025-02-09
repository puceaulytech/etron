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
// TODO: add some more styling to the two functions bellow
/**
 * @param {HTMLDivElement} newSection
 */
function selectNewSection(newSection) {
    newSection.style.fontWeight = "bolder";
    sectionBindings.get(newSection).classList.add("active");
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

currentSection = sectionBindings.keys().next().value;
// selectNewSection(currentSection); I gotta remember to uncomment that at some point

/**
 * @param {SubmitEvent} event
 */
function submitLogin(event) {
    event.preventDefault();
    const usernameInput = document.querySelector(
        "form.login-form input[name='username']",
    );
    const passwordInput = document.querySelector(
        "form.login-form input[name='password']",
    );
    fetch("/api/auth/login", {
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
    });
}
