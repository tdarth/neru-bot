const { getServerConfig } = require('../../utils/server/getServerConfig');
const { getUserData } = require('../user/getUserData');
const { updateUserData } = require('../../utils/user/updateUserData');

async function checkLevelUp(serverId, userId) {
    const serverConfig = await getServerConfig(serverId);
    const userData = await getUserData();

    if (userData.xp >= userData.next_level_xp) {
        await updateUserData(serverId, userId, 'xp', 0);
        await updateUserData(serverId, userId, 'level', getUserData.level + 1);
        await updateUserData(serverId, userId, 'next_level_xp', serverConfig.xp_levelup_mode == 'fixed' ? serverConfig.xp_levelup_amount : Math.floor(serverConfig.xp_levelup_amount * serverConfig.xp_levelup_multiplier));
    }
}

module.exports = { checkLevelUp };