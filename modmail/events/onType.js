const { Events, EmbedBuilder } = require('discord.js');
const { messages } = require('../messages.json');
const { modmailShowUserTypingIndicators, modmailUseBuiltInTypingIndicators, modmailUserTypingIndicatorsFetchCount } = require('../config.json');
const { getChannelByUser } = require('../db/utils/helper');
const { getChannelFromId } = require('../utils/getChannelFromId');

module.exports = {
    name: Events.TypingStart,
    async execute(typing) {
        if (!modmailShowUserTypingIndicators) return;
        if (typing.guild) return;
        if (typing.user.bot) return;

        const modmailChannelId = await getChannelByUser(process.env.GUILD_ID, typing?.user?.id) || null;
        if (!modmailChannelId) return;

        const modmailChannel = await getChannelFromId(typing.client, modmailChannelId) || null;
        if (!modmailChannel) return console.log(`[MODMAIL] User typing indicator error (channel not found): ${e}`)

        const embed = new EmbedBuilder();
        embed.setAuthor({ name: typing?.user?.username || 'unknown', iconURL: `https://cdn.discordapp.com/avatars/${typing?.user?.id}/${typing?.user?.avatar}.png` });
        embed.setDescription(messages.info.USER_START_TYPING || '**Started typing...**');
        embed.setColor('#242429');
        embed.setTimestamp(Date.now());

        try {
            if (modmailUseBuiltInTypingIndicators) return await modmailChannel.sendTyping();

            let found = false;
            const topModmailMessages = await modmailChannel.messages.fetch({ limit: modmailUserTypingIndicatorsFetchCount || 10 });

            for (const message of topModmailMessages.values()) {
                if (message.embeds) {
                    for (const mmEmbed of message.embeds) {
                        if (mmEmbed.description == (messages?.info?.USER_START_TYPING || '**Started typing...**')) {
                            found = true
                            break;
                        }
                    }
                }
                if (found) break;
            }

            if (found) return;
            await modmailChannel.send({
                embeds: [embed]
            });
        } catch (e) {
            console.log(`[MODMAIL] User typing indicator error: ${e}`)
        }
    },
};