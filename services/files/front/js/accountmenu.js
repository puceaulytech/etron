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
