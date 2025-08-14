const updateXp = require('./updateXp');

async function forceAddXp(serverId, userId, amount) {
    await updateXp(serverId, userId, xp => xp + amount);
    return await checkLevelUp(serverId, userId);
}

module.exports = { forceAddXp };