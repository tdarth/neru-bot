const { forceAddXp } = require('../leveling/forceAddXp');
const { getServerConfig } = require('../../utils/server/getServerConfig');
const { updateUserData } = require('../../utils/user/updateUserData');
const { toMySQLDate } = require('../sqlDate');

async function addXp(serverId, userId, type, channel = null) {
    const serverConfig = await getServerConfig(serverId);

    if (type == 'msg') {
        await updateUserData(serverId, userId, 'last_message', toMySQLDate(Date.now()));
        await forceAddXp(serverId, userId, serverConfig.xp_mode == 'fixed' ? serverConfig.xp_static : Math.floor(Math.random() * (serverConfig.xp_random_max - serverConfig.xp_random_min + 1)) + serverConfig.xp_random_min, channel);
    }
}

module.exports = { addXp };