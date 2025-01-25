let globalGameState;

function getGameState() {
    return globalGameState;
}

const BOARD_HEIGHT = 9;
const BOARD_WIDTH = 16;

// We can switch player by negating the value
const PLAYER = 1;
const OPPONENT = -1;

function playerText(p) {
    return p === 1 ? "PLAYER" : "OPPONENT";
}

const AbsoluteDirections = {
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    BOTTOM_LEFT: "BOTTOM_LEFT",
    BOTTOM_RIGHT: "BOTTOM_RIGHT",
    TOP_LEFT: "TOP_LEFT",
    TOP_RIGHT: "TOP_RIGHT",
};

const ABS_DIR_IDX = {
    [AbsoluteDirections.TOP_LEFT]: 0,
    [AbsoluteDirections.TOP_RIGHT]: 1,
    [AbsoluteDirections.RIGHT]: 2,
    [AbsoluteDirections.BOTTOM_RIGHT]: 3,
    [AbsoluteDirections.BOTTOM_LEFT]: 4,
    [AbsoluteDirections.LEFT]: 5,
};

const IDX_ABS_DIR = [
    AbsoluteDirections.TOP_LEFT,
    AbsoluteDirections.TOP_RIGHT,
    AbsoluteDirections.RIGHT,
    AbsoluteDirections.BOTTOM_RIGHT,
    AbsoluteDirections.BOTTOM_LEFT,
    AbsoluteDirections.LEFT,
];

const TeacherDirections = {
    KEEP_GOING: "KEEP_GOING",
    LIGHT_RIGHT: "LIGHT_RIGHT",
    HEAVY_RIGHT: "HEAVY_RIGHT",
    HEAVY_LEFT: "HEAVY_LEFT",
    LIGHT_LEFT: "LIGHT_LEFT",
};

function isPositionEqual(posA, posB) {
    if (typeof posA === "undefined") throw new Error("posA is undefined");
    if (typeof posB === "undefined") throw new Error("posB is undefined");

    return posA.row === posB.row && posA.column === posB.column;
}

function isDirectionBackToBack(first, second) {
    if (typeof first === "undefined") throw new Error("first is undefined");
    if (typeof second === "undefined") throw new Error("second is undefined");

    const currentIdx = ABS_DIR_IDX[first];
    const nextIdx = ABS_DIR_IDX[second];

    const diff = (nextIdx - currentIdx + 6) % 6;

    return diff === 3;
}

function positionReverse(pos) {
    const idx = ABS_DIR_IDX[pos];
    const newIdx = (idx + 3) % 6;
    return IDX_ABS_DIR[newIdx];
}

function movePositionInDirection(position, direction) {
    const delta = { column: 0, row: 0 };
    const evenRow = position.row % 2 === 0;

    switch (direction) {
        case AbsoluteDirections.LEFT:
            delta.column = -1;
            delta.row = 0;
            break;
        case AbsoluteDirections.RIGHT:
            delta.column = 1;
            delta.row = 0;
            break;
        case AbsoluteDirections.BOTTOM_LEFT:
            delta.column = evenRow ? -1 : 0;
            delta.row = 1;
            break;
        case AbsoluteDirections.BOTTOM_RIGHT:
            delta.column = evenRow ? 0 : 1;
            delta.row = 1;
            break;
        case AbsoluteDirections.TOP_LEFT:
            delta.column = evenRow ? -1 : 0;
            delta.row = -1;
            break;
        case AbsoluteDirections.TOP_RIGHT:
            delta.column = evenRow ? 0 : 1;
            delta.row = -1;
            break;
    }

    return {
        column: position.column + delta.column,
        row: position.row + delta.row,
    };
}

function directionFromPositions(previousPos, nextPos) {
    const columnDiff = nextPos.column - previousPos.column;
    const rowDiff = nextPos.row - previousPos.row;
    const evenRow = previousPos.row % 2 === 0;

    if (columnDiff === 0 && rowDiff === 1) {
        return evenRow
            ? AbsoluteDirections.BOTTOM_RIGHT
            : AbsoluteDirections.BOTTOM_LEFT;
    } else if (columnDiff === 0 && rowDiff === -1) {
        return evenRow
            ? AbsoluteDirections.TOP_RIGHT
            : AbsoluteDirections.TOP_LEFT;
    } else if (columnDiff === -1 && rowDiff === 0) {
        return AbsoluteDirections.LEFT;
    } else if (columnDiff === 1 && rowDiff === 0) {
        return AbsoluteDirections.RIGHT;
    } else if (columnDiff === -1 && rowDiff === 1) {
        return AbsoluteDirections.BOTTOM_LEFT;
    } else if (columnDiff === 1 && rowDiff === 1) {
        return AbsoluteDirections.BOTTOM_RIGHT;
    } else if (columnDiff === -1 && rowDiff === -1) {
        return AbsoluteDirections.TOP_LEFT;
    } else if (columnDiff === 1 && rowDiff === -1) {
        return AbsoluteDirections.TOP_RIGHT;
    }

    throw new Error("invalid positions");
}

function teacherPosToRealPos(teacherPosition) {
    return { column: teacherPosition.column - 1, row: teacherPosition.row - 1 };
}

class GameState {
    constructor(playerPosition, opponentPosition) {
        this.playerPosition = playerPosition;
        this.opponentPosition = opponentPosition;

        // If the player starts at the left of the grid, head towards right, left otherwise
        this.playerDirection =
            this.playerPosition.column === 0
                ? AbsoluteDirections.RIGHT
                : AbsoluteDirections.LEFT;

        this.opponentDirection =
            this.opponentPosition.column === 0
                ? AbsoluteDirections.RIGHT
                : AbsoluteDirections.LEFT;

        this.board = new Array(BOARD_HEIGHT);

        for (let i = 0; i < BOARD_HEIGHT; i++)
            this.board[i] = new Array(
                i % 2 === 0 ? BOARD_WIDTH : BOARD_WIDTH - 1,
            ).fill(0);
    }

    computeTeacherDirection(nextAbsoluteDirection) {
        const currentIdx = ABS_DIR_IDX[this.playerDirection];
        const nextIdx = ABS_DIR_IDX[nextAbsoluteDirection];

        const diff = (nextIdx - currentIdx + 6) % 6;

        if (diff === 0) {
            return TeacherDirections.KEEP_GOING;
        } else if (diff === 1) {
            return TeacherDirections.LIGHT_RIGHT;
        } else if (diff === 2) {
            return TeacherDirections.HEAVY_RIGHT;
        } else if (diff === 3) {
            throw new Error("we cannot turn back!!");
        } else if (diff === 4) {
            return TeacherDirections.HEAVY_LEFT;
        } else if (diff == 5) {
            return TeacherDirections.LIGHT_LEFT;
        }

        return teacherDir;
    }

    getPlayerDirection(player) {
        if (player === PLAYER) {
            return this.playerDirection;
        } else {
            return this.opponentDirection;
        }
    }

    setPlayerDirection(player, value) {
        if (!value) throw new Error("value is undefined");

        if (player === PLAYER) {
            this.playerDirection = value;
        } else {
            this.opponentDirection = value;
        }
    }

    getPlayerPosition(player) {
        return player === PLAYER ? this.playerPosition : this.opponentPosition;
    }

    setPlayerPosition(player, value) {
        if (!value) throw new Error("value is undefined");

        if (player === PLAYER) {
            this.playerPosition = value;
        } else {
            this.opponentPosition = value;
        }
    }

    getCell(position) {
        return this.board[position.row][position.column];
    }

    setCell(position, value) {
        this.board[position.row][position.column] = value;
    }

    isOutOfBounds(position) {
        return (
            position.row < 0 ||
            position.column < 0 ||
            position.row >= this.board.length ||
            position.column >= this.board[position.row].length
        );
    }

    getLegalMoves(player) {
        return this.getLegalMovesFromPos(
            this.getPlayerPosition(player),
            this.getPlayerDirection(player),
        );
    }

    getLegalMovesFromPos(currentPosition, currentDirection) {
        const legalMoves = [];

        for (const newDirection of Object.values(AbsoluteDirections)) {
            const newPosition = movePositionInDirection(
                currentPosition,
                newDirection,
            );

            if (
                !this.isOutOfBounds(newPosition) &&
                !isDirectionBackToBack(currentDirection, newDirection) &&
                !isPositionEqual(newPosition, this.opponentPosition) &&
                !isPositionEqual(newPosition, this.playerPosition) &&
                this.getCell(newPosition) === 0
            ) {
                legalMoves.push(newPosition);
            }
        }

        return legalMoves;
    }

    moveTo(player, nextPosition) {
        const previousPosition = this.getPlayerPosition(player);
        const previousDirection = this.getPlayerDirection(player);

        const positionsEqual = isPositionEqual(nextPosition, previousPosition);

        /* Mark trail
         * We skip trail marking if the previous and next position are the same.
         * This happens at the very first move of the game. */
        if (!positionsEqual) this.setCell(previousPosition, player);

        // Change player position
        this.setPlayerPosition(player, nextPosition);
        if (!positionsEqual)
            this.setPlayerDirection(
                player,
                directionFromPositions(previousPosition, nextPosition),
            );

        return { position: previousPosition, direction: previousDirection };
    }

    moveBack(player, previousMove) {
        // Unmark trail
        this.setCell(previousMove.position, 0);

        // Revert position
        this.setPlayerPosition(player, previousMove.position);
        this.setPlayerDirection(player, previousMove.direction);
    }
}

async function setup(playersState) {
    globalGameState = new GameState(
        teacherPosToRealPos(playersState.playerPosition),
        teacherPosToRealPos(playersState.opponentPosition),
    );

    return true;
}

async function nextMove(playersState) {
    // Convert player positions
    const playerCurrentPosition = teacherPosToRealPos(
        playersState.playerPosition,
    );
    const opponentCurrentPosition = teacherPosToRealPos(
        playersState.opponentPosition,
    );

    // Update game state
    globalGameState.moveTo(PLAYER, playerCurrentPosition);
    globalGameState.moveTo(OPPONENT, opponentCurrentPosition);

    // Run AI
    const playerNextPosition = nextMoveStateless(globalGameState);

    // Compute absolute direction
    const nextAbsoluteDirection = directionFromPositions(
        playerCurrentPosition,
        playerNextPosition,
    );

    // Compute teacher's direction
    const teacherDir = globalGameState.computeTeacherDirection(
        nextAbsoluteDirection,
    );

    return teacherDir;
}

// WORK IN PROGRESS
function distancesAll(gameState, startPos, startDir) {
    const distances = new Array(BOARD_HEIGHT);

    for (let i = 0; i < BOARD_HEIGHT; i++)
        distances[i] = new Array(
            i % 2 === 0 ? BOARD_WIDTH : BOARD_WIDTH - 1,
        ).fill(-1);

    distances[startPos.row][startPos.column] = 0;
    const visitQueue = [{ pos: startPos, dir: startDir }];

    while (visitQueue.length !== 0) {
        const { pos: currentPos, dir: currentDir } = visitQueue.shift();

        const legalMoves = gameState.getLegalMovesFromPos(
            currentPos,
            currentDir,
        );

        const currentDistance = distances[currentPos.row][currentPos.column];

        for (const nextPos of legalMoves) {
            if (distances[nextPos.row][nextPos.column] === -1) {
                distances[nextPos.row][nextPos.column] = currentDistance + 1;

                const nextDir = directionFromPositions(currentPos, nextPos);

                visitQueue.push({
                    pos: nextPos,
                    dir: nextDir,
                });
            }
        }
    }

    return distances;
}

function heuristic(gameState, currentPlayer) {
    const distancesPlayer = distancesAll(
        gameState,
        gameState.getPlayerPosition(currentPlayer),
        gameState.getPlayerDirection(currentPlayer),
    );

    const distancesOpponent = distancesAll(
        gameState,
        gameState.getPlayerPosition(-currentPlayer),
        gameState.getPlayerDirection(-currentPlayer),
    );

    let reachableByPlayer = 0;
    let reachableByOpponent = 0;

    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            if (row % 2 == 1 && col == BOARD_WIDTH - 1) continue;

            if (distancesPlayer[row][col] > distancesOpponent[row][col]) {
                reachableByPlayer++;
            } else if (
                distancesPlayer[row][col] < distancesOpponent[row][col]
            ) {
                reachableByOpponent++;
            }
        }
    }

    return reachableByPlayer - reachableByOpponent;
}

const NEGAMAX_DEPTH = 5;

// FOR DEBUG
function padDepth(d) {
    return "-".repeat(NEGAMAX_DEPTH - d + 1);
}

function negamax(gameState, currentPlayer, depth, alpha, beta) {
    if (depth <= 0) {
        const score = heuristic(gameState, currentPlayer);

        console.log(`${padDepth(depth)} heuristic: ${score}`);

        return { score, move: null };
    }

    const legalMoves = gameState.getLegalMoves(currentPlayer);

    if (legalMoves.length == 0) {
        // that's bad for the current player
        console.log(
            `${padDepth(depth)} ${playerText(currentPlayer)} has no legal moves`,
        );
        return { score: -100000, move: null };
    }

    console.log(
        `${padDepth(depth)} legal moves for ${playerText(currentPlayer)}:`,
        legalMoves,
    );

    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMove = null;

    for (const legalMove of legalMoves) {
        const previousMove = gameState.moveTo(currentPlayer, legalMove);

        let { score } = negamax(
            gameState,
            -currentPlayer,
            depth - 1,
            -beta,
            -alpha,
        );

        score = -score;

        if (score > bestScore) {
            bestScore = score;
            bestMove = legalMove;
        }

        gameState.moveBack(currentPlayer, previousMove);

        alpha = Math.max(alpha, bestScore);
        if (alpha >= beta) break;
    }

    return { score: bestScore, move: bestMove };
}

function nextMoveStateless(gameState) {
    const { move } = negamax(
        gameState,
        PLAYER,
        NEGAMAX_DEPTH,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
    );

    return move;
}

module.exports = {
    setup,
    nextMove,
    getGameState,
    GameState,
    BOARD_WIDTH,
    BOARD_HEIGHT,
    TeacherDirections,
    AbsoluteDirections,
    stateless: { nextMove: nextMoveStateless },
};

// TESTING
let initialState = {
    playerPosition: { row: 1, column: 1 },
    opponentPosition: {
        row: 7,
        column: 10,
    },
};

setup(initialState);

console.time("nextMove");
nextMove(initialState).then((move) => {
    console.log("");
    console.log(move);
    console.log("");
    console.timeEnd("nextMove");
});
