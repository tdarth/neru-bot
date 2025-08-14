const updateXp = require('./updateXp');

async function forceRemoveXp(serverId, userId, amount) {
    return updateXp(serverId, userId, xp => Math.max(0, xp - amount));
}

module.exports = { forceRemoveXp };