const { Events, EmbedBuilder } = require('discord.js');
const { messages } = require('../messages.json');
const { modmailShowUserTypingIndicators, modmailUseBuiltInTypingIndicators } = require('../config.json');
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

            await modmailChannel.send({
                embeds: [embed]
            });
        } catch (e) {
            console.log(`[MODMAIL] User typing indicator error: ${e}`)
        }
    },
};