disableMouseMovement = true;

const joystick = document.querySelector("game-joystick");
let direction;

joystick.addEventListener("joystick-move", (e) => {
    let { x, y } = e.detail;

    y *= -1;

    let radians = Math.atan2(y, x);
    let degrees = radians * (180 / Math.PI);

    direction = getHexDirection(degrees + 180);

    updateNextMousePos(direction);

    socket.emit("move", {
        gameId,
        direction,
    });
});

socket.on("gamestate", () => {
    updateNextMousePos(direction);
});
