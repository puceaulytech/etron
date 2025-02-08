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

// TODO: add some more styling to the two functions bellow
/**
 * @param {HTMLDivElement} newSection
 */
function selectNewSection(newSection) {
    newSection.style.fontWeight = "bolder";
}
/**
 * @param {HTMLDivElement} oldSection
 */
function unselectOldSection(oldSection) {
    oldSection.style.fontWeight = "normal";
}

const allSections = document.querySelectorAll("#menu-header .section");
let currentSection = allSections[0]; // unsafe? naaaaaah, I'm sure it'll be fine
selectNewSection(currentSection);

allSections.forEach((section) =>
    section.addEventListener("click", () => {
        if (section === currentSection) return;
        selectNewSection(section);
        unselectOldSection(currentSection);
        currentSection = section;
    }),
);
