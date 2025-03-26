function sanitizeUserInfo(user) {
    const { password, friendRequests, friends, ...sanitized } = user;
    return sanitized;
}

const isUsernameValid = (username) => /^[a-zA-Z0-9._]{3,25}$/.test(username);

module.exports = { isUsernameValid, sanitizeUserInfo };
