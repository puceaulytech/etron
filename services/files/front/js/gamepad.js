window.addEventListener("gamepadconnected", (event) => {
    console.log("Gamepad connected:", event.gamepad);
    disableMouseMovement = true;
    requestAnimationFrame(updateGamepad);
});

window.addEventListener("gamepaddisconnected", (event) => {
    console.log("Gamepad disconnected:", event.gamepad);
    disableMouseMovement = false;
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
    }
    gamepadRequest = requestAnimationFrame(updateGamepad);
}
