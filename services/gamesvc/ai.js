let globalGameState;

function getGameState() {
    return globalGameState;
}

const BOARD_HEIGHT = 9;
const BOARD_WIDTH = 16;

// We can switch player but negating the value
const PLAYER = 1;
const OPPONENT = -1;

class GameState {
    constructor(playerPosition, opponentPosition) {
        this.playerPosition = playerPosition;
        this.opponentPosition = opponentPosition;

        this.board = new Array(BOARD_HEIGHT);

        for (let i = 0; i < BOARD_HEIGHT; i++)
            this.board[i] = new Array(
                i % 2 === 0 ? BOARD_WIDTH : BOARD_WIDTH - 1,
            ).fill(0);
    }

    updatePositions(playerPosition, opponentPosition) {
        // Mark trails
        this.board[this.playerPosition.row][this.playerPosition.column] =
            PLAYER;
        this.board[this.opponentPosition.row][this.opponentPosition.column] =
            OPPONENT;

        this.playerPosition = playerPosition;
        this.opponentPosition = opponentPosition;
    }
}

function negamax(gameState, currentPlayer, depth, alpha, beta) {
    if (depth <= 0 /* || isGameOver */) {
        // return heuristic or big ass number if game over, negative if currentPlayer is opponent, positive otherwise
    }

    const legalMoves = []; /* = getLegalMoves(); */
    let score = Number.NEGATIVE_INFINITY;

    for (const legalMove of legalMoves) {
        // apply move

        score = Math.max(
            score,
            -negamax(gameState, depth - 1, -beta, -alpha, -currentPlayer),
        );

        // revert move

        alpha = Math.max(alpha, score);
        if (alpha >= beta) break;
    }

    return score;
}

async function setup(playersState) {
    globalGameState = new GameState(
        playersState.playerPosition,
        playersState.opponentPosition,
    );

    return true;
}

async function nextMove(playersState) {
    globalGameState.updatePositions(playersState);

    return nextMoveStateless(globalGameState);
}

function nextMoveStateless(gameState) {}

module.exports = {
    setup,
    nextMove,
    getGameState,
    stateless: { nextMove: nextMoveStateless },
};
