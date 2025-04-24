function handleJoystickMove(event, inverted) {
    let { x, y } = event.detail;

    y *= -1;
    if (!inverted) x *= -1;

    let radians = Math.atan2(y, x);
    let degrees = radians * (180 / Math.PI);

    const newMove = getHexDirection(degrees + 180);

    updateNextMousePos(newMove);

    if (newMove !== lastMove) {
        socket.emit("move", {
            gameId,
            direction: newMove,
        });
        lastMove = newMove;
    }
}

function handleJoystickAppear(event) {
    const j = document.querySelector("game-joystick");
    j.style.left = `${event.detail.x - j.offsetWidth / 2}px`;
    j.style.top = `${event.detail.y - j.offsetHeight / 2}px`;
    j.style.opacity = 1;
}

function handleJoystickDisappear() {
    const j = document.querySelector("game-joystick");
    j.style.opacity = 0;
}
