const { Events, ChannelType, EmbedBuilder } = require('discord.js');
const { getDiscUserById } = require('../utils/getDiscUserById');
const { prefixes, modmailChannelType } = require('../config.json');
const { getUserByChannel } = require('../db/utils/helper');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (modmailChannelType == 0 && message.channel.type !== ChannelType.GuildText) return;
        if (modmailChannelType == 1 && message.channel.type !== ChannelType.PrivateThread) return;
        if (!message.channel.name.includes('modmail')) return;
        if (message.author.bot) return;
        if (message.content.startsWith(prefixes.IGNORE)) return;

        console.log(message.content)

        const userId = message?.channel?.topic || await getUserByChannel(message.guild.id, message.channel.id) || null;
        const author = message.author;

        if (userId) {
            const user = await getDiscUserById(message.client, userId) || null;
            if (!user) return;

            const embed = new EmbedBuilder();
            embed.setAuthor({ name: message.content.startsWith(prefixes.HIDE_NAME) ? 'Staff' : author?.username || 'unknown', iconURL: message.content.startsWith(prefixes.HIDE_NAME) ? `https://cdn.discordapp.com/avatars/${message.client.user.id}/${message.client.user.avatar}.png` : `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png` });
            embed.setColor('#242429');
            embed.setTimestamp(Date.now());

            const cleanedMessage = message.content.replace(/^=\s*/, "").trim();

            let toAdd = cleanedMessage;

            if (message.stickers.size > 0) toAdd += `\n\n${message.stickers.map(sticker => `**__Sticker:__** ${sticker.url}`).join('\n')}`;

            if (toAdd.length > 0) {
                embed.setDescription(toAdd);
            }

            const files = message.attachments.size > 0 ? Array.from(message.attachments.values()) : undefined;

            if (message.stickers.size > 0 || message.attachments.size > 0) embed.setFooter(`Message contains ${message.stickers.size} + ${message.attachments.size} attachments.`);

            try {
                await user.send({
                    embeds: [embed],
                    ...(files && { files })
                });
                await message.react('✅');
            } catch (err) {
                console.log(`[MODMAIL] Error in sending message to ${user.id}: ${err}`);
                await message.react('❌');
            }
        }
    },
};