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

    /**
     * @param {Array<Array>} board
     */
    move(board, delta) {
        /* Place trail */
        board[this.pos.y][this.pos.x] = this.id + 10;
        /* Move player */
        this.pos.x += delta.x;
        this.pos.y += delta.y;
        /* Check death */
        if (
            this.pos.x < 0 ||
            this.pos.y < 0 ||
            this.pos.y >= board.length ||
            this.pos.x >= board[0].length || // unsafe?
            board[this.pos.y][this.pos.x] !== 0
        )
            return;
        /* Update position on board */
        board[this.pos.y][this.pos.x] = this.id;
    }

    position() {
        return this.pos;
    }

    placeInBoard(board) {
        board[this.pos.y][this.pos.x] = this.id;
    }
}
