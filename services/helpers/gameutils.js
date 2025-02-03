const BOARD_HEIGHT = 9;
const BOARD_WIDTH = 16;

const PLAYER = 1;
const OPPONENT = -1;

function playerText(p) {
    return p === 1 ? "PLAYER" : "OPPONENT";
}

class Direction {
    static LEFT = new Direction("LEFT");
    static RIGHT = new Direction("RIGHT");
    static BOTTOM_LEFT = new Direction("BOTTOM_LEFT");
    static BOTTOM_RIGHT = new Direction("BOTTOM_RIGHT");
    static TOP_LEFT = new Direction("TOP_LEFT");
    static TOP_RIGHT = new Direction("TOP_RIGHT");

    static ABS_DIR_IDX = {
        [Direction.TOP_LEFT.kind]: 0,
        [Direction.TOP_RIGHT.kind]: 1,
        [Direction.RIGHT.kind]: 2,
        [Direction.BOTTOM_RIGHT.kind]: 3,
        [Direction.BOTTOM_LEFT.kind]: 4,
        [Direction.LEFT.kind]: 5,
    };

    constructor(kind) {
        this.kind = kind;
    }

    /**
     * Tests if two directions are equals
     *
     * @param {Direction} other The other operand
     * @returns {boolean} true if they are equals, otherwise false
     */
    equals(other) {
        if (typeof other === "undefined")
            throw new Error("other operand is undefined");

        return this.kind === other.kind;
    }

    /**
     * Returns a list of all possible directions
     *
     * @returns {Direction[]} A list of directions
     */
    static values() {
        return [
            Direction.LEFT,
            Direction.RIGHT,
            Direction.BOTTOM_LEFT,
            Direction.BOTTOM_RIGHT,
            Direction.TOP_LEFT,
            Direction.TOP_RIGHT,
        ];
    }

    /**
     * Checks if the current direction is the direct opposite of a given direction
     *
     * @param {Direction} other The other direction
     * @returns {boolean} true if the two positions are opposite, otherwise false
     */
    isOppositeTo(other) {
        if (typeof other === "undefined")
            throw new Error("other operand is undefined");

        const thisIdx = Direction.ABS_DIR_IDX[this.kind];
        const otherIdx = Direction.ABS_DIR_IDX[other.kind];

        const diff = (otherIdx - thisIdx + 6) % 6;

        return diff === 3;
    }
}

class Position {
    /**
     * Constructs a new position
     *
     * @param {number} column
     * @param {number} row
     */
    constructor(column, row) {
        this.column = column;
        this.row = row;
    }

    /**
     * Checks if two positions are equals
     *
     * @param {Position} other The other operand
     * @returns {boolean} true if both positions are equals, otherwise false
     */
    equals(other) {
        if (typeof other === "undefined")
            throw new Error("other operand is undefined");

        return this.column === other.column && this.row === other.row;
    }

    /**
     * Moves the current position in a new direction, returning the new position
     *
     * @param {Direction} dir The direction to move in
     * @returns {Position} The new position
     */
    moveInDirection(dir) {
        const delta = { column: 0, row: 0 };
        const evenRow = this.row % 2 === 0;

        switch (dir) {
            case Direction.LEFT:
                delta.column = -1;
                delta.row = 0;
                break;
            case Direction.RIGHT:
                delta.column = 1;
                delta.row = 0;
                break;
            case Direction.BOTTOM_LEFT:
                delta.column = evenRow ? -1 : 0;
                delta.row = 1;
                break;
            case Direction.BOTTOM_RIGHT:
                delta.column = evenRow ? 0 : 1;
                delta.row = 1;
                break;
            case Direction.TOP_LEFT:
                delta.column = evenRow ? -1 : 0;
                delta.row = -1;
                break;
            case Direction.TOP_RIGHT:
                delta.column = evenRow ? 0 : 1;
                delta.row = -1;
                break;
        }

        return new Position(this.column + delta.column, this.row + delta.row);
    }

    /**
     * Computes the movement direction between a start position and an end position
     *
     * @param {Position} previousPos The start position
     * @param {Position} nextPos The end position
     * @returns {Direction} The movement direction
     */
    static diffDir(previousPos, nextPos) {
        const columnDiff = nextPos.column - previousPos.column;
        const rowDiff = nextPos.row - previousPos.row;
        const evenRow = previousPos.row % 2 === 0;

        if (columnDiff === 0 && rowDiff === 1) {
            return evenRow ? Direction.BOTTOM_RIGHT : Direction.BOTTOM_LEFT;
        } else if (columnDiff === 0 && rowDiff === -1) {
            return evenRow ? Direction.TOP_RIGHT : Direction.TOP_LEFT;
        } else if (columnDiff === -1 && rowDiff === 0) {
            return Direction.LEFT;
        } else if (columnDiff === 1 && rowDiff === 0) {
            return Direction.RIGHT;
        } else if (columnDiff === -1 && rowDiff === 1) {
            return Direction.BOTTOM_LEFT;
        } else if (columnDiff === 1 && rowDiff === 1) {
            return Direction.BOTTOM_RIGHT;
        } else if (columnDiff === -1 && rowDiff === -1) {
            return Direction.TOP_LEFT;
        } else if (columnDiff === 1 && rowDiff === -1) {
            return Direction.TOP_RIGHT;
        }

        throw new Error("invalid positions");
    }

    /**
     * Converts offset grid coordinates to cube coordinates
     *
     * @return {{x: number, y: number, z: number}} The cube coordinates
     */
    toCubeCoords() {
        const x = this.column - Math.ceil(this.row / 2);
        const z = this.row;
        const y = -x - z;

        return { x, y, z };
    }

    /**
     * Computes the hexagonal distance between two positions
     *
     * @param {Position} startPos The start position
     * @param {Position} endPos The end position
     * @returns {number} The hexagonal distance
     */
    static hexDistance(startPos, endPos) {
        const startPosCube = startPos.toCubeCoords();
        const endPosCube = endPos.toCubeCoords();

        return (
            (Math.abs(endPosCube.x - startPosCube.x) +
                Math.abs(endPosCube.y - startPosCube.y) +
                Math.abs(endPosCube.z - startPosCube.z)) /
            2
        );
    }
}

class GameState {
    /**
     * Constructs a new game state
     * @param {Position} playerPosition The initial player position (the AI)
     * @param {Position} opponentPosition The initial opponent position
     */
    constructor(playerPosition, opponentPosition) {
        this.playerPosition = playerPosition;
        this.opponentPosition = opponentPosition;

        // If the player starts at the left of the grid, head towards right, left otherwise
        this.playerDirection =
            this.playerPosition.column === 0 ? Direction.RIGHT : Direction.LEFT;

        this.opponentDirection =
            this.opponentPosition.column === 0
                ? Direction.RIGHT
                : Direction.LEFT;

        this.board = new Array(BOARD_HEIGHT);

        for (let i = 0; i < BOARD_HEIGHT; i++)
            this.board[i] = new Array(
                i % 2 === 0 ? BOARD_WIDTH : BOARD_WIDTH - 1,
            ).fill(0);
    }

    /**
     * Retrieves the direction of a given player
     *
     * @param {number} player
     * @returns {Direction} The direction of the player
     */
    getPlayerDirection(player) {
        if (player === PLAYER) {
            return this.playerDirection;
        } else {
            return this.opponentDirection;
        }
    }

    /**
     * Updates the direction of a given a player
     *
     * @param {number} player The given player
     * @param {Direction} value The new direction
     */
    setPlayerDirection(player, value) {
        if (!value) throw new Error("value is undefined");

        if (player === PLAYER) {
            this.playerDirection = value;
        } else {
            this.opponentDirection = value;
        }
    }

    /**
     * Retrieves the position of a given player
     *
     * @param {number} player The given player
     * @returns {Position} The position of the player
     */
    getPlayerPosition(player) {
        return player === PLAYER ? this.playerPosition : this.opponentPosition;
    }

    /**
     * Updates the position of a given player
     *
     * @param {number} player The given player
     * @param {Position} value The new position
     */
    setPlayerPosition(player, value) {
        if (!value) throw new Error("value is undefined");

        if (player === PLAYER) {
            this.playerPosition = value;
        } else {
            this.opponentPosition = value;
        }
    }

    /**
     * Retrieves the content of a cell on the grid
     *
     * @param {Position} position The position of the cell
     * @returns {number} The value of the cell
     */
    getCell(position) {
        return this.board[position.row][position.column];
    }

    /**
     * Updates the content of a cell on the grid
     *
     * @param {Position} position The position of the cell
     * @param {number} value The new value of the cell
     */
    setCell(position, value) {
        this.board[position.row][position.column] = value;
    }

    /**
     * Checks if a given position is out of bounds
     * @param {Position} position The position
     * @returns {boolean} true if it is out of bounds, otherwise false
     */
    isOutOfBounds(position) {
        return (
            position.row < 0 ||
            position.column < 0 ||
            position.row >= this.board.length ||
            position.column >= this.board[position.row].length
        );
    }

    /**
     * Computes a list of all legal moves that can be played by a given player
     *
     * @param {number} player The given player
     * @returns {{ legalMoves: Position[], possibleHeadCollision: boolean }} A list of positions
     */
    getLegalMoves(player) {
        return this.getLegalMovesFromPos(
            this.getPlayerPosition(player),
            this.getPlayerDirection(player),
        );
    }

    /**
     * Computes a list of all legal moves that can be played given a position and a direction
     *
     * @param {Position} currentPosition The given position
     * @param {Direction} currentDirection The given direction
     * @returns {{ legalMoves: Position[], possibleHeadCollision: boolean }} A list of positions
     */
    getLegalMovesFromPos(currentPosition, currentDirection) {
        const legalMoves = [];
        let possibleHeadCollision = false;

        for (const newDirection of Direction.values()) {
            const newPosition = currentPosition.moveInDirection(newDirection);

            if (this.isOutOfBounds(newPosition)) continue;

            if (currentDirection.isOppositeTo(newDirection)) continue;

            if (
                newPosition.equals(this.opponentPosition) ||
                newPosition.equals(this.playerPosition)
            ) {
                possibleHeadCollision = true;
                continue;
            }

            if (this.getCell(newPosition) !== 0) continue;

            legalMoves.push(newPosition);
        }

        return { legalMoves, possibleHeadCollision };
    }

    /**
     * Moves a given player to a new position and update the game state
     *
     * @param {number} player The given player
     * @param {Position} nextPosition The new player's position
     * @returns {{position: Position, direction: Direction}} The previous position and direction, useful when moving back
     * @see GameState#moveBack
     */
    moveTo(player, nextPosition) {
        const previousPosition = this.getPlayerPosition(player);
        const previousDirection = this.getPlayerDirection(player);

        const positionsEqual = nextPosition.equals(previousPosition);

        /* Mark trail
         * We skip trail marking if the previous and next position are the same.
         * This happens at the very first move of the game. */
        if (!positionsEqual) this.setCell(previousPosition, player);

        // Change player position
        this.setPlayerPosition(player, nextPosition);
        if (!positionsEqual)
            this.setPlayerDirection(
                player,
                Position.diffDir(previousPosition, nextPosition),
            );

        return { position: previousPosition, direction: previousDirection };
    }

    /**
     * Restores a player's position add direction
     *
     * @param {number} player The target player
     * @param {{position: Position, direction: Direction}} previousMove The move to restore
     */
    moveBack(player, previousMove) {
        // Unmark trail
        this.setCell(previousMove.position, 0);

        // Revert position
        this.setPlayerPosition(player, previousMove.position);
        this.setPlayerDirection(player, previousMove.direction);
    }
}

module.exports = {
    BOARD_WIDTH,
    BOARD_HEIGHT,
    Direction,
    Position,
    GameState,
};
