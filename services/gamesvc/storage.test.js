const { Storage } = require("./storage");

test("should add new client", () => {
    const storage = new Storage();
    storage.addClient(456);

    expect(storage.wsClients).toContain(456);
});

test("should remove client", () => {
    const storage = new Storage();
    storage.addClient(456);
    storage.removeClient(456);

    expect(storage.wsClients).not.toContain(456);
});
