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
    rawMove(board, delta) {
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

    /**
     * @param {Array<Array>} board
     * @param {string} direction
     */
    move(board, direction) {
        switch (direction) {
            case "LEFT":
                this.rawMove(board, { x: -1, y: 0 });
                break;
            case "RIGHT":
                this.rawMove(board, { x: 1, y: 0 });
                break;
            case "BOTTOM_LEFT":
                this.rawMove(board, {
                    x: this.pos.y % 2 === 0 ? -1 : 0,
                    y: 1,
                });
                break;
            case "BOTTOM_RIGHT":
                this.rawMove(board, {
                    x: this.pos.y % 2 === 0 ? 0 : 1,
                    y: 1,
                });
                break;
            case "TOP_LEFT":
                this.rawMove(board, {
                    x: this.pos.y % 2 === 0 ? -1 : 0,
                    y: -1,
                });
                break;
            case "TOP_RIGHT":
                this.rawMove(board, {
                    x: this.pos.y % 2 === 0 ? 0 : 1,
                    y: -1,
                });
                break;
        }
    }

    position() {
        return this.pos;
    }

    placeInBoard(board) {
        board[this.pos.y][this.pos.x] = this.id;
    }
}
