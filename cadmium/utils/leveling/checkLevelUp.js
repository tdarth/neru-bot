const { ChannelType, MessageFlags, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder } = require('discord.js');
const { getServerConfig } = require('../../utils/server/getServerConfig');
const { getUserData } = require('../user/getUserData');
const { updateUserData } = require('../../utils/user/updateUserData');
const { generateMessageCard } = require('../../utils/leveling/generateMessageCard');
const { fetchLevelRoles } = require('../../utils/level-roles/fetchLevelRoles');
const { getDiscUserById } = require('../getDiscUserById');
const { modifyLevelRolesForUser } = require('../../utils/level-roles/modifyLevelRolesForUser');
const { client } = require('../../index');

async function checkLevelUp(serverId, userId, channel = null) {
    const serverConfig = await getServerConfig(serverId);
    let userData = await getUserData(serverId, userId);
    const levelUpLocation = serverConfig.level_up_message_location;
    let oldLevel = userData.level;
    let xp = userData.xp;
    let level = userData.level;
    let nextLevelXp = userData.next_level_xp;

    if (userData.level >= 2147483647) return;

    switch (serverConfig.xp_levelup_mode) {
        case 'fixed': {
            const xpPerLevel = serverConfig.xp_levelup_amount;
            const levelsGained = Math.floor(xp / xpPerLevel);
            if (levelsGained !== 0) {
                xp -= levelsGained * xpPerLevel;
                level += levelsGained;
                nextLevelXp = xpPerLevel;
            }
            break;
        }
        case 'additive': {
            let tempXp = xp;
            let tempLevel = level;
            let tempNextLevelXp = nextLevelXp;
            while (tempXp >= tempNextLevelXp) {
                tempXp -= tempNextLevelXp;
                tempLevel++;
                tempNextLevelXp += serverConfig.xp_levelup_amount;
            }
            while (tempXp < 0 && tempLevel > 0) {
                tempLevel--;
                tempNextLevelXp -= serverConfig.xp_levelup_amount;
                tempXp += tempNextLevelXp;
            }
            xp = tempXp;
            level = tempLevel;
            nextLevelXp = tempNextLevelXp;
            break;
        }
        case 'exponential': {
            let tempXp = xp;
            let tempLevel = level;
            let tempNextLevelXp = nextLevelXp;
            if (serverConfig.xp_levelup_multiplier > 1 && serverConfig.xp_levelup_amount >= 1) {
                while (tempXp >= tempNextLevelXp) {
                    tempXp -= tempNextLevelXp;
                    tempLevel++;
                    tempNextLevelXp = Math.floor(serverConfig.xp_levelup_amount * Math.pow(serverConfig.xp_levelup_multiplier, tempLevel));
                }
                while (tempXp < 0 && tempLevel > 0) {
                    tempLevel--;
                    tempNextLevelXp = Math.floor(serverConfig.xp_levelup_amount * Math.pow(serverConfig.xp_levelup_multiplier, tempLevel));
                    tempXp += tempNextLevelXp;
                }
            } else {
                const xpPerLevel = serverConfig.xp_levelup_amount;
                const levelsGained = Math.floor(xp / xpPerLevel);
                if (levelsGained !== 0) {
                    xp -= levelsGained * xpPerLevel;
                    level += levelsGained;
                    nextLevelXp = xpPerLevel;
                }
            }
            xp = tempXp;
            level = tempLevel;
            nextLevelXp = tempNextLevelXp;
            break;
        }
        default: {
            const xpPerLevel = serverConfig.xp_levelup_amount;
            const levelsGained = Math.floor(xp / xpPerLevel);
            if (levelsGained !== 0) {
                xp -= levelsGained * xpPerLevel;
                level += levelsGained;
                nextLevelXp = xpPerLevel;
            }
            break;
        }
    }

    if (level !== oldLevel) {
        await updateUserData(serverId, userId, 'xp', xp);
        await updateUserData(serverId, userId, 'level', level);
        await updateUserData(serverId, userId, 'next_level_xp', nextLevelXp);

        let userData = await getUserData(serverId, userId);
        let user = await getDiscUserById(userId);
        let member = await getDiscUserById(userId, true, serverId);

        const stack = serverConfig.stack_level_roles_enabled;

        const roles = await fetchLevelRoles(serverId, userData.level, stack);
        await modifyLevelRolesForUser(member, roles, stack);

        if (levelUpLocation == 0) return;
        if (levelUpLocation != 1) {
            channel = client.channels.cache.get(levelUpLocation) || await client.channels.fetch(levelUpLocation).catch(() => null);
            if (!channel) return;
        }

        let response = new ContainerBuilder();

        let levelUpMessage = serverConfig.level_up_message
            .replaceAll('{user}', `<@${userId}>`)
            .replaceAll('{display}', user.displayName)
            .replaceAll('{xp}', userData.xp)
            .replaceAll('{totalXp}', userData.total_xp)
            .replaceAll('{oldLevel}', oldLevel)
            .replaceAll('{newLevel}', userData.level)
            .replaceAll('\\n', '\n');

        let levelUpMessageCard = serverConfig.level_up_message_card
            .replaceAll('{user}', user.username)
            .replaceAll('{display}', user.displayName)
            .replaceAll('{xp}', userData.xp)
            .replaceAll('{totalXp}', userData.total_xp)
            .replaceAll('{oldLevel}', oldLevel)
            .replaceAll('{newLevel}', userData.level);

        if (serverConfig.level_up_message != '<empty>') {
            response.addTextDisplayComponents(new TextDisplayBuilder().setContent(levelUpMessage));
        }

        if (serverConfig.level_up_message_card_enabled == 1) {
            let messageCard = await generateMessageCard({
                title: serverConfig.level_up_message_card_displayname_enabled == 1 ? user.displayName || user.username : user.username,
                description: levelUpMessageCard,
                avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
                bg_color: '#202024',
                description_color: userData.card_bar_color
            });
            response.addMediaGalleryComponents(new MediaGalleryBuilder({ items: [{ media: { url: messageCard } }] }));
        }

        if (channel?.type === ChannelType.GuildText) {
            await channel.send({ flags: MessageFlags.IsComponentsV2, components: [response], allowedMentions: { parse: ['users'] } });
        }
    }
}

module.exports = { checkLevelUp };