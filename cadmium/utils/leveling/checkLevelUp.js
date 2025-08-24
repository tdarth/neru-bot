const { ChannelType, MessageFlags, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder } = require('discord.js');
const { getServerConfig } = require('../../utils/server/getServerConfig');
const { getUserData } = require('../user/getUserData');
const { updateUserData } = require('../../utils/user/updateUserData');
const { generateMessageCard } = require('../../utils/leveling/generateMessageCard');
const { fetchLevelRoles } = require('../../utils/level-roles/fetchLevelRoles');
const { getDiscUserById } = require('../getDiscUserById');
const { modifyLevelRolesForUser } = require('../../utils/level-roles/modifyLevelRolesForUser');
const { client } = require('../../index');

const MAX_LEVEL = 2147483647;
const MIN_LEVEL = 0;

async function checkLevelUp(serverId, userId, channel = null) {
    const serverConfig = await getServerConfig(serverId);
    let userData = await getUserData(serverId, userId);

    let oldLevel = userData.level;
    let xp = userData.xp;
    let level = userData.level;
    let nextLevelXp = userData.next_level_xp;

    if (level >= MAX_LEVEL) return;

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
                const levelsGained = Math.floor(tempXp / xpPerLevel);
                if (levelsGained !== 0) {
                    tempXp -= levelsGained * xpPerLevel;
                    tempLevel += levelsGained;
                    tempNextLevelXp = xpPerLevel;
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

    if (level >= MAX_LEVEL) {
        level = MAX_LEVEL;
        xp = 0;
        nextLevelXp = 0;
        console.warn(`[LevelUp] User ${userId} reached max level ${MAX_LEVEL} in server ${serverId}`);
    } else if (level <= MIN_LEVEL) {
        level = MIN_LEVEL;
        xp = 0;
        nextLevelXp = serverConfig.xp_levelup_amount || 100;
    }

    if (level !== oldLevel) {
        await updateUserData(serverId, userId, 'xp', xp);
        await updateUserData(serverId, userId, 'level', level);
        await updateUserData(serverId, userId, 'next_level_xp', nextLevelXp);

        userData = await getUserData(serverId, userId);
        const user = await getDiscUserById(userId);
        const member = await getDiscUserById(userId, true, serverId);

        const stack = serverConfig.stack_level_roles_enabled;
        const roles = await fetchLevelRoles(serverId, userData.level, stack);
        await modifyLevelRolesForUser(member, roles, stack);

        const levelUpLocation = serverConfig.level_up_message_location;
        if (levelUpLocation === 0 || (serverConfig.level_up_message === '<empty>' && !serverConfig.level_up_message_card_enabled)) return;
        if (levelUpLocation !== 1) {
            channel = client.channels.cache.get(levelUpLocation) || await client.channels.fetch(levelUpLocation).catch(() => null);
            if (!channel) return;
        }

        const response = new ContainerBuilder();

        const levelUpMessage = serverConfig.level_up_message
            .replaceAll('{user}', `<@${userId}>`)
            .replaceAll('{userId}', user.id)
            .replaceAll('{username}', user.username)
            .replaceAll('{displayname}', user.displayName)
            .replaceAll('{xp}', userData.xp)
            .replaceAll('{totalXp}', userData.total_xp)
            .replaceAll('{oldLevel}', oldLevel)
            .replaceAll('{newLevel}', userData.level)
            .replaceAll('\\n', '\n');

        const levelUpMessageCard = serverConfig.level_up_message_card
            .replaceAll('{user}', user.username)
            .replaceAll('{display}', user.displayName)
            .replaceAll('{xp}', userData.xp)
            .replaceAll('{totalXp}', userData.total_xp)
            .replaceAll('{oldLevel}', oldLevel)
            .replaceAll('{newLevel}', userData.level);

        if (serverConfig.level_up_message !== '<empty>') {
            response.addTextDisplayComponents(new TextDisplayBuilder().setContent(levelUpMessage));
        }

        if (serverConfig.level_up_message_card_enabled === 1) {
            const messageCard = await generateMessageCard({
                title: serverConfig.level_up_message_card_displayname_enabled === 1 ? user.displayName || user.username : user.username,
                description: levelUpMessageCard,
                avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
                bg_color: '#242429',
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