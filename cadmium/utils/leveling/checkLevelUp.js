const { getServerConfig } = require('../../utils/server/getServerConfig');
const { getUserData } = require('../user/getUserData');
const { updateUserData } = require('../../utils/user/updateUserData');

async function checkLevelUp(serverId, userId) {
    const serverConfig = await getServerConfig(serverId);
    const userData = await getUserData(serverId, userId);

    if (userData.xp >= userData.next_level_xp) {
        await updateUserData(serverId, userId, 'xp', 0);
        await updateUserData(serverId, userId, 'level', userData.level + 1);
        await updateUserData(serverId, userId, 'next_level_xp', serverConfig.xp_levelup_mode == 'fixed' ? userData.next_level_xp + serverConfig.xp_levelup_amount : Math.floor(userData.next_level_xp + serverConfig.xp_levelup_amount * serverConfig.xp_levelup_multiplier));
    }
}

module.exports = { checkLevelUp };