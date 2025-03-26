const { isUsernameValid, sanitizeUserInfo } = require("./sanitizer");

describe("sanitizeUserInfo", () => {
    test("should not return some blacklisted infos", () => {
        const dbUser = {
            _id: "420",
            username: "logan",
            elo: 5000,
            password: "strongpassword",
            friendRequests: ["romain", "capybara"],
            friends: ["vella"],
        };

        const sanitizedUser = sanitizeUserInfo(dbUser);

        expect(sanitizedUser.password).toBeUndefined();
        expect(sanitizedUser.friendRequests).toBeUndefined();
        expect(sanitizedUser.friends).toBeUndefined();

        expect(sanitizedUser.username).toBe(dbUser.username);
        expect(sanitizedUser._id).toBe(dbUser._id);
        expect(sanitizedUser.elo).toBe(dbUser.elo);
    });
});

describe("isUsernameValid", () => {
    test("should not allow certain characters", () => {
        let username = "test-ify";
        expect(isUsernameValid(username)).toBeFalsy();

        username = "test&test";
        expect(isUsernameValid(username)).toBeFalsy();

        username = 'hello"';
        expect(isUsernameValid(username)).toBeFalsy();

        username = "<a>hack</a>";
        expect(isUsernameValid(username)).toBeFalsy();
    });

    test("should not allow too short or too long", () => {
        let username = "aa";
        expect(isUsernameValid(username)).toBeFalsy();

        username = "thisisaverylongusernamethatwillbreakeverything";
        expect(isUsernameValid(username)).toBeFalsy();
    });

    test("should allow correct usernames", () => {
        let username = "logan";
        expect(isUsernameValid(username)).toBeTruthy();

        username = "KikouDu93";
        expect(isUsernameValid(username)).toBeTruthy();

        username = "XxXx_Gamer_XxXx";
        expect(isUsernameValid(username)).toBeTruthy();

        username = "sylvain.duriff";
        expect(isUsernameValid(username)).toBeTruthy();
    });
});
