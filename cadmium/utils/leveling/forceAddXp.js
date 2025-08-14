const updateXp = require('./updateXp');

async function forceAddXp(serverId, userId, username, amount) {
    return updateXp(serverId, userId, username, xp => xp + amount);
}

module.exports = { forceAddXp };