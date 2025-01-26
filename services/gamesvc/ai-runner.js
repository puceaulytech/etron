const { setup, nextMove } = require("./ai");

let initialState = {
    playerPosition: { row: 1, column: 1 },
    opponentPosition: {
        row: 9,
        column: 16,
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
