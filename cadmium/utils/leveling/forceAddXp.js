const updateXp = require('./updateXp');
const { checkLevelUp } = require('../../utils/leveling/checkLevelUp');

async function forceAddXp(serverId, userId, amount, channel = null) {
    await updateXp(serverId, userId, xp => xp + amount);
    return await checkLevelUp(serverId, userId, channel);
}

module.exports = { forceAddXp };