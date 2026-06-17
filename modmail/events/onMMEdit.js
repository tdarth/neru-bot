const { Events, ChannelType, EmbedBuilder, ThreadAutoArchiveDuration, MessageFlags, ContainerBuilder, TextDisplayBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { getUserByChannel, getEmbedMessageFromUser } = require('../db/utils/helper');
const { getDiscUserById } = require('../utils/getDiscUserById');
const { getChannelFromId } = require('../utils/getChannelFromId');
const { messages } = require('../messages.json');
const { prefixes, modmailChannelType, associateMessageToEmbed } = require('../config.json');
const { formatUser } = require('../utils/formatUser');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        if (modmailChannelType == 0 && newMessage.channel.type !== ChannelType.GuildText) return;
        if (modmailChannelType == 1 && newMessage.channel.type !== ChannelType.PrivateThread) return;
        if (!newMessage.channel.name.includes('modmail')) return;
        if (newMessage.author.bot) return;
        if (newMessage.content.startsWith(prefixes.IGNORE)) return;

        const userId = newMessage?.channel?.topic || await getUserByChannel(newMessage.guild.id, newMessage.channel.id) || null;
        const author = newMessage.author;

        if (userId) {
            const user = await getDiscUserById(newMessage.client, userId) || null;
            if (!user) return;

            const embed = new EmbedBuilder();
            embed.setAuthor({ name: newMessage.content.startsWith(prefixes.HIDE_NAME) ? 'Staff' : author?.username || 'unknown', iconURL: newMessage.content.startsWith(prefixes.HIDE_NAME) ? `https://cdn.discordapp.com/avatars/${newMessage.client.user.id}/${newMessage.client.user.avatar}.png` : `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png` });
            embed.setColor('#242429');
            embed.setTimestamp(Date.now());

            const cleanedMessage = newMessage.content.replace(/^=\s*/, "").trim();

            let toAdd = cleanedMessage;

            if (toAdd.length > 0) {
                embed.setDescription(toAdd);
            }

            const files = newMessage.attachments.size > 0 ? Array.from(newMessage.attachments.values()) : [];

            if (newMessage.stickers.size > 0) {
                newMessage.stickers.forEach(sticker => {
                    files.push(new AttachmentBuilder(sticker.url).setName(`sticker_${sticker.id}.png`));
                });
            }


            let editedMessageWarning = `:pencil: Edited message.`;

            const oldMessageEmbedId = await getEmbedMessageFromUser(oldMessage.id, newMessage.channel.id);
            const dmChannel = await user.createDM();
            editedMessageWarning += oldMessageEmbedId ? ` [**Original**](https://discord.com/channels/@me/${dmChannel.id}/${oldMessageEmbedId.id})` : ' **Failed to fetch original message.**';

            const toEditReply = await dmChannel.messages.fetch(oldMessageEmbedId);

            try {
                if (toEditReply) {
                    await toEditReply.edit({
                        embeds: [embed],
                        ...(files && { files })
                    });
                } else {
                    await user.send({
                        content: editedMessageWarning,
                        embeds: [embed],
                        ...(files && { files })
                    });
                }

                await newMessage.react('✏️');
            } catch (err) {
                if (String(err).startsWith("DiscordAPIError[50007]")) await newMessage.reply(messages.errors.USER_HAS_DMS_DISABLED);
                console.log(`[MODMAIL] Error in sending message to ${user.id}: ${err}`);
                await newMessage.reply(messages.errors.MESSAGE_NOT_EDITED);
            }
        }
    },
};