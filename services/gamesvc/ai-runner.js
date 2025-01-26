const { setup, nextMove } = require("./ai");

const initialState = {
    playerPosition: { row: 1, column: 1 },
    opponentPosition: {
        row: 9,
        column: 16,
    },
};

const nextState = {
    playerPosition: { row: 1, column: 2 },
    opponentPosition: {
        row: 9,
        column: 15,
    },
};

async function run() {
    await setup(initialState);

    await nextMove(initialState);
    await nextMove(nextState);
}

run();
