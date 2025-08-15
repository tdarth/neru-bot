const updateXp = require('./updateXp');
const { checkLevelUp } = require('./checkLevelUp');

async function forceSetXp(serverId, userId, amount, channel = null) {
    await updateXp(serverId, userId, () => amount);
    return await checkLevelUp(serverId, userId, channel);
}

module.exports = { forceSetXp };