const ctx = canvas.getContext("2d");

ctx.fillStyle = "#000000";
ctx.strokeStyle = "#000000";
ctx.lineWidth = 3;

const board = new Array(boardHeight);

for (let i = 0; i < boardHeight; i++)
    board[i] = new Array(i % 2 === 0 ? boardWidth : boardWidth - 1).fill(0);

const startingPosition = Math.floor(Math.random() * boardHeight);
board[startingPosition][0] = 1;
board[boardHeight - startingPosition - 1][boardWidth - 1] = 2;

drawBoard(ctx, board);
