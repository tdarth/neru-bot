const { Events, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getDiscUserById } = require('../utils/getDiscUserById');
const { messages } = require('../messages.json');
const { prefixes, modmailChannelType } = require('../config.json');
const { getUserByChannel, associateMessageToEmbed } = require('../utils/store');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (modmailChannelType == 0 && message.channel.type !== ChannelType.GuildText) return;
        if (modmailChannelType == 1 && message.channel.type !== ChannelType.PrivateThread) return;
        if (!message.channel.name.includes('modmail')) return;
        if (message.author.bot) return;
        if (message.content.startsWith(prefixes.IGNORE)) return;
        if (message.messageSnapshots.first()) {
            await message.reply(messages.errors.NO_FORWARDED_MESSAGES);
            return await message.react('❌');
        }

        const userId = message?.channel?.topic || getUserByChannel(message.guild.id, message.channel.id) || null;
        const author = message.author;

        if (userId) {
            const member = await getDiscUserById(message.client, userId, true, message.guild.id) || null;
            if (!member) return await message.react('❌');

            const user = member.user;

            const embed = new EmbedBuilder();
            embed.setAuthor({ name: message.content.startsWith(prefixes.HIDE_NAME) ? 'Staff' : author?.username || 'unknown', iconURL: message.content.startsWith(prefixes.HIDE_NAME) ? `https://cdn.discordapp.com/avatars/${message.client.user.id}/${message.client.user.avatar}.png` : `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png` });
            embed.setColor('#242429');
            embed.setTimestamp(Date.now());

            const cleanedMessage = message.content.replace(/^=\s*/, "").trim();

            let toAdd = cleanedMessage;

            if (toAdd.length > 0) {
                embed.setDescription(toAdd);
            }

            const files = message.attachments.size > 0 ? Array.from(message.attachments.values()) : [];

            if (message.stickers.size > 0) {
                message.stickers.forEach(sticker => {
                    files.push(new AttachmentBuilder(sticker.url).setName(`sticker_${sticker.id}.png`));
                });
            }

            try {
                const finalEmbed = await user.send({
                    embeds: [embed],
                    ...(files && { files })
                });

                associateMessageToEmbed(message.id, finalEmbed.id, message.channel.id);
                await message.react('✅');
            } catch (err) {
                if (String(err).startsWith("DiscordAPIError[50007]")) await message.reply(messages.errors.USER_HAS_DMS_DISABLED);
                console.log(`[MODMAIL] Error in sending message to ${user.id}: ${err}`);
                await message.react('❌');
                await message.reply(messages.errors.SPECIFIC.replaceAll("{error}", String(err)));
            }
        }
    },
};