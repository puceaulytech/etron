function computeMove(mouseX, mouseY, inverted) {
    const vector = {
        x: -mouseX + gameGrid.somePlayerPos.x + gameGrid.offsetLeft,
        y: -mouseY + gameGrid.somePlayerPos.y + gameGrid.offsetTop,
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
