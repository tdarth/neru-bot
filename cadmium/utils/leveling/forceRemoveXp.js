const updateXp = require('./updateXp');

async function forceRemoveXp(serverId, userId, username, amount) {
    return updateXp(serverId, userId, username, xp => Math.max(0, xp - amount));
}

module.exports = { forceRemoveXp };