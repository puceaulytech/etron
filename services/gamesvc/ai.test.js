const { GameState, BOARD_WIDTH, BOARD_HEIGHT } = require("./ai");

describe("isOutOfBounds", () => {
    it("should return true for positions out of bounds", () => {
        const gameState = new GameState(
            { row: 0, column: 0 },
            { row: 1, column: 1 },
        );

        expect(gameState.isOutOfBounds({ row: -1, column: 0 })).toBe(true); // Above the board
        expect(gameState.isOutOfBounds({ row: 0, column: -1 })).toBe(true); // Left of the board
        expect(gameState.isOutOfBounds({ row: BOARD_HEIGHT, column: 0 })).toBe(
            true,
        ); // Below the board
        expect(gameState.isOutOfBounds({ row: 0, column: BOARD_WIDTH })).toBe(
            true,
        ); // Right of the board
    });

    it("should return false for positions within bounds", () => {
        const gameState = new GameState(
            { row: 0, column: 0 },
            { row: 1, column: 1 },
        );

        expect(gameState.isOutOfBounds({ row: 0, column: 0 })).toBe(false); // Top-left corner
        expect(
            gameState.isOutOfBounds({ row: BOARD_HEIGHT - 1, column: 0 }),
        ).toBe(false); // Bottom-left corner
        expect(
            gameState.isOutOfBounds({ row: 0, column: BOARD_WIDTH - 1 }),
        ).toBe(false); // Top-right corner
        expect(
            gameState.isOutOfBounds({
                row: BOARD_HEIGHT - 1,
                column: BOARD_WIDTH - 1,
            }),
        ).toBe(false); // Bottom-right corner
    });
});

describe("getLegalMoves", () => {
    it("should return all legal moves for PLAYER in the middle of the board", () => {
        const gameState = new GameState(
            { row: 4, column: 8 },
            { row: 0, column: 0 },
        );

        const legalMoves = gameState.getLegalMoves(1);
        expect(legalMoves).toContainEqual({ row: 3, column: 8 }); // Up
        expect(legalMoves).toContainEqual({ row: 5, column: 8 }); // Down
        expect(legalMoves).toContainEqual({ row: 4, column: 7 }); // Left
        expect(legalMoves).toContainEqual({ row: 4, column: 9 }); // Right
        expect(legalMoves).toContainEqual({ row: 3, column: 9 }); // Upper Right
        expect(legalMoves).toContainEqual({ row: 5, column: 7 }); // Lower Left
    });

    it("should return all legal moves for OPPONENT in the middle of the board", () => {
        const gameState = new GameState(
            { row: 0, column: 0 },
            { row: 4, column: 8 },
        );

        const legalMoves = gameState.getLegalMoves(-1);
        expect(legalMoves).toContainEqual({ row: 3, column: 8 }); // Up
        expect(legalMoves).toContainEqual({ row: 5, column: 8 }); // Down
        expect(legalMoves).toContainEqual({ row: 4, column: 7 }); // Left
        expect(legalMoves).toContainEqual({ row: 4, column: 9 }); // Right
        expect(legalMoves).toContainEqual({ row: 3, column: 9 }); // Upper Right
        expect(legalMoves).toContainEqual({ row: 5, column: 7 }); // Lower Left
    });

    it("should return only moves within bounds for edge positions", () => {
        const gameState = new GameState(
            { row: 0, column: 0 },
            { row: 1, column: 1 },
        );

        const legalMoves = gameState.getLegalMoves(1);
        expect(legalMoves).not.toContainEqual({ row: -1, column: 0 }); // Above
        expect(legalMoves).not.toContainEqual({ row: 0, column: -1 }); // Left
        expect(legalMoves).toContainEqual({ row: 1, column: 0 }); // Down
        expect(legalMoves).toContainEqual({ row: 0, column: 1 }); // Right
    });

    it("should exclude moves into occupied cells", () => {
        const gameState = new GameState(
            { row: 4, column: 8 },
            { row: 4, column: 9 },
        );
        gameState.board[3][8] = 1; // Mark cell as occupied

        const legalMoves = gameState.getLegalMoves(1);
        expect(legalMoves).not.toContainEqual({ row: 3, column: 8 }); // Occupied cell
        expect(legalMoves).toContainEqual({ row: 5, column: 8 }); // Down
    });
});
