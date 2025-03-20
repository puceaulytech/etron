function objectIdIncludes(objectIds, id) {
    return objectIds.some(
        (currentId) => currentId.toString() === id.toString(),
    );
}

module.exports = { objectIdIncludes };
