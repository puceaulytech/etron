const { setup, nextMove } = require("./ai");

let initialState = {
    playerPosition: { row: 1, column: 1 },
    opponentPosition: {
        row: 8,
        column: 8,
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
