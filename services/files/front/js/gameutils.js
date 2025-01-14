/**
 * @param {Array<Array>} board
 * @return {boolean}
 */
function gameDone(board) {
    const flatBoard = board.flat();
    return !(flatBoard.includes(1) && flatBoard.includes(2));
}

class Player {
    constructor(id, x = 0, y = 0) {
        this.id = id;
        this.pos = {
            x: x,
            y: y,
        };
    }

    move(delta) {
        this.pos.x += delta.x;
        this.pos.y += delta.y;
    }

    position() {
        return this.pos;
    }

    placeInBoard(board) {
        board[this.pos.y][this.pos.x] = this.id;
    }
}
