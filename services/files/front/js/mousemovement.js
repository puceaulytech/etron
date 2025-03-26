function computeMove(mouseX, mouseY, inverted = false) {
    const vector = {
        x: -mouseX + gameGrid.somePlayerPos.x + gameGrid.offsetLeft,
        y: -mouseY + gameGrid.somePlayerPos.y + gameGrid.trueOffsetTop,
    };
    if (inverted) vector.x *= -1;

    let radians = Math.atan2(vector.y, vector.x);
    let degrees = radians * (180 / Math.PI);

    return getHexDirection(degrees + 180);
}

function getHexDirection(angle) {
    if (angle >= 330 || angle < 30) return "RIGHT";
    if (angle >= 30 && angle < 90) return "BOTTOM_RIGHT";
    if (angle >= 90 && angle < 150) return "BOTTOM_LEFT";
    if (angle >= 150 && angle < 210) return "LEFT";
    if (angle >= 210 && angle < 270) return "TOP_LEFT";
    if (angle >= 270 && angle < 330) return "TOP_RIGHT";
}

function moveInDirection(pos, dir) {
    const delta = { x: 0, y: 0 };
    const evenRow = pos.y % 2 === 0;

    switch (dir) {
        case "LEFT":
            delta.x = -1;
            delta.y = 0;
            break;
        case "RIGHT":
            delta.x = 1;
            delta.y = 0;
            break;
        case "BOTTOM_LEFT":
            delta.x = evenRow ? -1 : 0;
            delta.y = 1;
            break;
        case "BOTTOM_RIGHT":
            delta.x = evenRow ? 0 : 1;
            delta.y = 1;
            break;
        case "TOP_LEFT":
            delta.x = evenRow ? -1 : 0;
            delta.y = -1;
            break;
        case "TOP_RIGHT":
            delta.x = evenRow ? 0 : 1;
            delta.y = -1;
            break;
    }
    return { x: pos.x + delta.x, y: pos.y + delta.y };
}

function updateNextMousePos(newMove) {
    let playerPos = gameGrid.getAttribute("playerpos");

    if (playerPos) {
        playerPos = JSON.parse(playerPos);

        const nextMousePos = moveInDirection(
            { x: playerPos.column, y: playerPos.row },
            newMove,
        );

        gameGrid.setAttribute("nextmousepos", JSON.stringify(nextMousePos));
    }
}
