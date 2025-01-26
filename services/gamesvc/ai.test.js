const { Direction, Position } = require("./ai");

describe("Direction", () => {
    test("Direction.equals should compare two directions correctly", () => {
        expect(Direction.LEFT.equals(Direction.LEFT)).toBe(true);
        expect(Direction.LEFT.equals(Direction.RIGHT)).toBe(false);

        expect(() => Direction.LEFT.equals(undefined)).toThrowError(
            "other operand is undefined",
        );
    });

    test("Direction.isOppositeTo should correctly identify opposite directions", () => {
        expect(Direction.LEFT.isOppositeTo(Direction.RIGHT)).toBe(true);
        expect(Direction.TOP_LEFT.isOppositeTo(Direction.BOTTOM_RIGHT)).toBe(
            true,
        );
        expect(Direction.TOP_RIGHT.isOppositeTo(Direction.BOTTOM_LEFT)).toBe(
            true,
        );
        expect(Direction.LEFT.isOppositeTo(Direction.LEFT)).toBe(false);

        expect(() => Direction.LEFT.isOppositeTo(undefined)).toThrowError(
            "other operand is undefined",
        );
    });

    test("Direction.toTeacherDirection should return correct teacher direction", () => {
        expect(
            Direction.toTeacherDirection(Direction.LEFT, Direction.LEFT),
        ).toBe("KEEP_GOING");

        expect(
            Direction.toTeacherDirection(Direction.LEFT, Direction.BOTTOM_LEFT),
        ).toBe("LIGHT_LEFT");

        expect(
            Direction.toTeacherDirection(
                Direction.LEFT,
                Direction.BOTTOM_RIGHT,
            ),
        ).toBe("HEAVY_LEFT");

        expect(() =>
            Direction.toTeacherDirection(Direction.LEFT, Direction.RIGHT),
        ).toThrowError("we cannot turn back!!");

        expect(
            Direction.toTeacherDirection(Direction.LEFT, Direction.TOP_RIGHT),
        ).toBe("HEAVY_RIGHT");

        expect(
            Direction.toTeacherDirection(Direction.LEFT, Direction.TOP_LEFT),
        ).toBe("LIGHT_RIGHT");
    });
});

describe("Position", () => {
    test("Position.equals should compare two positions correctly", () => {
        const pos1 = new Position(2, 3);
        const pos2 = new Position(2, 3);
        const pos3 = new Position(3, 4);

        expect(pos1.equals(pos2)).toBe(true);
        expect(pos1.equals(pos3)).toBe(false);

        expect(() => pos1.equals(undefined)).toThrowError(
            "other operand is undefined",
        );
    });

    test("Position.moveInDirection should move position in a given direction", () => {
        const pos = new Position(2, 2);

        expect(pos.moveInDirection(Direction.LEFT)).toEqual(new Position(1, 2));
        expect(pos.moveInDirection(Direction.RIGHT)).toEqual(
            new Position(3, 2),
        );
        expect(pos.moveInDirection(Direction.TOP_LEFT)).toEqual(
            new Position(1, 1),
        );
        expect(pos.moveInDirection(Direction.TOP_RIGHT)).toEqual(
            new Position(2, 1),
        );
        expect(pos.moveInDirection(Direction.BOTTOM_LEFT)).toEqual(
            new Position(1, 3),
        );
        expect(pos.moveInDirection(Direction.BOTTOM_RIGHT)).toEqual(
            new Position(2, 3),
        );
    });

    test("Position.diffDir should determine direction difference between two positions", () => {
        const pos1 = new Position(2, 2);

        expect(Position.diffDir(pos1, new Position(1, 2))).toBe(Direction.LEFT);
        expect(Position.diffDir(pos1, new Position(3, 2))).toBe(
            Direction.RIGHT,
        );
        expect(Position.diffDir(pos1, new Position(1, 3))).toBe(
            Direction.BOTTOM_LEFT,
        );
        expect(Position.diffDir(pos1, new Position(2, 3))).toBe(
            Direction.BOTTOM_RIGHT,
        );
        expect(Position.diffDir(pos1, new Position(1, 1))).toBe(
            Direction.TOP_LEFT,
        );
        expect(Position.diffDir(pos1, new Position(2, 1))).toBe(
            Direction.TOP_RIGHT,
        );

        expect(() => Position.diffDir(pos1, new Position(0, 0))).toThrowError(
            "invalid positions",
        );
    });

    test("Position.fromTeacherPosition should convert teacher position to Position", () => {
        const teacherPos = { row: 3, column: 3 };
        const pos = Position.fromTeacherPosition(teacherPos);

        expect(pos).toEqual(new Position(2, 2));
    });
});
