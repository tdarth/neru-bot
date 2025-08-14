const updateXp = require('./updateXp');

async function forceAddXp(serverId, userId, amount) {
    return updateXp(serverId, userId, xp => xp + amount);
}

module.exports = { forceAddXp };