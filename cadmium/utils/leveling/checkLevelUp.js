const { getServerConfig } = require('../../utils/server/getServerConfig');
const { getUserData } = require('../user/getUserData');
const { updateUserData } = require('../../utils/user/updateUserData');
const ContainerMessage = require('../classes/ContainerMessage');

async function checkLevelUp(serverId, userId, channel = null) {
    const serverConfig = await getServerConfig(serverId);
    const userData = await getUserData(serverId, userId);

    const levelUpLocation = serverConfig.level_up_message_location;

    if (userData.xp >= userData.next_level_xp) {
        await updateUserData(serverId, userId, 'xp', 0);
        await updateUserData(serverId, userId, 'level', userData.level + 1);
        await updateUserData(serverId, userId, 'next_level_xp', serverConfig.xp_levelup_mode == 'fixed' ? serverConfig.xp_levelup_amount : Math.floor((userData.next_level_xp + serverConfig.xp_levelup_amount) * serverConfig.xp_levelup_multiplier));

        let newUserData = await getUserData(serverId, userId);

        if (levelUpLocation == '1' && channel) {
            await channel.send(new ContainerMessage(serverConfig.level_up_message
                .replaceAll('{user}', `<@${userId}>`)
                .replaceAll('{xp}', userData.xp)
                .replaceAll('{totalXp}', userData.total_xp)
                .replaceAll('{oldLevel}', userData.level)
                .replaceAll('{newLevel}', newUserData.level)
            ).setMentions({ parse: ['users'] }).build());
        }
    }
}

module.exports = { checkLevelUp };