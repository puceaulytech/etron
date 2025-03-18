function sanitizeUserInfo(user) {
    const { password, friendRequests, friends, ...sanitized } = user;
    return sanitized;
}

module.exports = { sanitizeUserInfo };
