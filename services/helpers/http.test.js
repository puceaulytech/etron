const { decodeCookies, encodeCookies } = require("./http");

describe("decodeCookies", () => {
    test("should decode basic cookie", () => {
        const res = decodeCookies("A=B; C=D");

        expect(res["A"]).toBe("B");
        expect(res["C"]).toBe("D");
    });

    test("should decode empty cookies", () => {
        const res = decodeCookies("A; C");

        expect(res["A"]).toBeUndefined();
        expect(res["C"]).toBeUndefined();
    });
});

describe("encodeCookies", () => {
    test("should encode basic cookie", () => {
        const res = encodeCookies({ A: "B", C: "D" });

        expect(res).toBe("A=B; C=D");
    });
});
