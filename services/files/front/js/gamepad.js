window.addEventListener("gamepadconnected", (event) => {
    disableMouseMovement = true;
    if (location.pathname === "/pages/online1v1.html") switchToGamepadEmotes();
    switchToGamepadControls();
    requestAnimationFrame(updateGamepad);
});

window.addEventListener("gamepaddisconnected", (event) => {
    disableMouseMovement = false;
    if (location.pathname === "/pages/online1v1.html") switchToKeyboardEmotes();
    switchToKeyboardControls();
    cancelAnimationFrame(gamepadRequest);
});

let gamepadRequest;
let lastExecutionTime = 0;
const executionInterval = 200;

function updateGamepadAngle(angle) {
    const direction = getHexDirection(angle);

    updateNextMousePos(direction);
}

function processGamepadAngle(angle) {
    const direction = getHexDirection(angle);

    socket.emit("move", {
        gameId,
        direction,
    });
}

function updateGamepad() {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
        const gp = gamepads[0];
        const x = gp.axes[0]; // Left stick X-axis
        const y = gp.axes[1]; // Left stick Y-axis

        // Compute joystick magnitude
        const magnitude = Math.sqrt(x * x + y * y);

        // Check if joystick is pushed at least one-third of the way
        if (magnitude >= 1 / 3) {
            // Compute angle in degrees
            let angle = Math.atan2(y, -x) * (180 / Math.PI);
            if (angle < 0) angle += 360; // Ensure positive angle

            updateGamepadAngle(angle);

            const currentTime = performance.now();
            if (currentTime - lastExecutionTime >= executionInterval) {
                processGamepadAngle(angle);
                lastExecutionTime = currentTime;
            }
        }

        let emoteIndex;
        let emotePressed = true;

        if (gp.buttons[0].pressed) {
            // A
            emoteIndex = 3;
        } else if (gp.buttons[1].pressed) {
            // B
            emoteIndex = 2;
        } else if (gp.buttons[3].pressed) {
            // X
            emoteIndex = 1;
        } else if (gp.buttons[2].pressed) {
            // Y
            emoteIndex = 0;
        } else if (gp.buttons[5].pressed) {
            // RB
            emoteIndex = 4;
        } else {
            emotePressed = false;
        }

        if (emotePressed) sendEmote(emoteIndex);
    }
    gamepadRequest = requestAnimationFrame(updateGamepad);
}

const controlsImg = document.querySelector(".mouse-controls img");

function switchToGamepadControls() {
    controlsImg.src = "/assets/joystick.svg";
}

function switchToKeyboardControls() {
    controlsImg.src = "/assets/mouse.svg";
}

if (typeof Capacitor !== "undefined" && Capacitor.isNativePlatform())
    switchToGamepadControls();
