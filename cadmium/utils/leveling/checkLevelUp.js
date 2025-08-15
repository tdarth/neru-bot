const { ChannelType, MessageFlags, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder } = require('discord.js');
const { getServerConfig } = require('../../utils/server/getServerConfig');
const { getUserData } = require('../user/getUserData');
const { updateUserData } = require('../../utils/user/updateUserData');
const { generateMessageCard } = require('../../utils/leveling/generateMessageCard');
const { getDiscUserById } = require('../getDiscUserById');
const { client } = require('../../index');

async function checkLevelUp(serverId, userId, channel = null) {
    const serverConfig = await getServerConfig(serverId);
    const userData = await getUserData(serverId, userId);

    const levelUpLocation = serverConfig.level_up_message_location;

    if (userData.xp >= userData.next_level_xp) {
        await updateUserData(serverId, userId, 'xp', userData.xp - userData.next_level_xp);
        await updateUserData(serverId, userId, 'level', userData.level + 1);
        await updateUserData(serverId, userId, 'next_level_xp', serverConfig.xp_levelup_mode == 'fixed' ? serverConfig.xp_levelup_amount : Math.floor(serverConfig.xp_levelup_amount * Math.pow(serverConfig.xp_levelup_multiplier, newUserData.level)));

        let newUserData = await getUserData(serverId, userId);

        if (levelUpLocation == 0) return;
        if (levelUpLocation != 1) {
            channel = client.channels.cache.get(levelUpLocation);

            if (!channel) {
                try {
                    channel = await client.channels.fetch(levelUpLocation);
                } catch (err) {
                    console.error(`Failed to fetch channel with ID ${levelUpLocation}:`, err);
                    return;
                }
            }
        }

        let response = new ContainerBuilder();
        let user = await getDiscUserById(userId);

        let levelUpMessage = serverConfig.level_up_message
            .replaceAll('{user}', `<@${userId}>`)
            .replaceAll('{xp}', userData.xp)
            .replaceAll('{totalXp}', userData.total_xp)
            .replaceAll('{oldLevel}', userData.level)
            .replaceAll('{newLevel}', newUserData.level);

        let levelUpMessageCard = serverConfig.level_up_message_card
            .replaceAll('{user}', user.username)
            .replaceAll('{display}', user.displayName)
            .replaceAll('{xp}', userData.xp)
            .replaceAll('{totalXp}', userData.total_xp)
            .replaceAll('{oldLevel}', userData.level)
            .replaceAll('{newLevel}', newUserData.level);


        if (serverConfig.level_up_message != '<empty>') {
            response
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(levelUpMessage)
                )
        }

        if (serverConfig.level_up_message_card_enabled == 1) {
            let messageCard = await generateMessageCard({
                title: serverConfig.level_up_message_card_displayname_enabled == 1 ? user.displayName || user.username : user.username,
                description: levelUpMessageCard,
                avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
                bg_color: '#202024',
                description_color: userData.card_bar_color
            })

            response
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder({
                        items: [
                            {
                                media: {
                                    url: messageCard,
                                },
                            },
                        ],
                    })
                )
        }

        if (channel?.type === ChannelType.GuildText) {
            await channel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [response],
                allowedMentions: { parse: ['users'] }
            });
        }

        if (newUserData.xp >= newUserData.next_level_xp) {
            checkLevelUp(serverId, userId, channel);
        }

    }
}

module.exports = { checkLevelUp };