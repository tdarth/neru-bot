const { Events, ChannelType, EmbedBuilder, ThreadAutoArchiveDuration, MessageFlags, ContainerBuilder, TextDisplayBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { getChannelByUser, addUserToChannel, clearChannel, getEmbedMessageFromUser } = require('../utils/store');
const { getChannelFromId } = require('../utils/getChannelFromId');
const { messages } = require('../messages.json');
const { modmailCategoryId, modmailChannelForThreadId, modmailChannelType, modmailPingStaffOnCreation, staffRoles, modmailWelcomeMessage, modmailShowUserTypingIndicators, modmailUserTypingIndicatorsFetchCount, modmailUseBuiltInTypingIndicators } = require('../config.json');
const { formatUser } = require('../utils/formatUser');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        if (newMessage.channel.type !== ChannelType.DM) return;
        if (oldMessage.author.bot) return;

        const client = newMessage.client;
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        const author = newMessage.author;

        let modmailChannelId = getChannelByUser(process.env.GUILD_ID, author.id);
        let modmailChannel;

        if (modmailChannelId) {
            modmailChannel = await getChannelFromId(client, modmailChannelId);
            if (!modmailChannel) return newMessage.reply(messages.errors.EDITED_MSG_WITHOUT_OPEN_TICKET);
        } else {
            if (!modmailChannel) return newMessage.reply(messages.errors.EDITED_MSG_WITHOUT_OPEN_TICKET);
        }

        if (!modmailChannel) {
            console.log(`[MODMAIL] Edit message: Unable to fetch channel for user ${author.id}`);
            return;
        }

        const embed = new EmbedBuilder();
        embed.setAuthor({ name: author?.username || 'unknown', iconURL: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png` });
        embed.setColor('#242429');
        embed.setTimestamp(Date.now());

        let toAdd = "";

        if (newMessage.content) toAdd += newMessage.content;

        if (toAdd) embed.setDescription(toAdd);

        const attachments = Array.from(newMessage.attachments.values());
        const files = attachments.length > 0 ? attachments : [];

        if (newMessage.stickers.size > 0) {
            newMessage.stickers.forEach(sticker => {
                files.push(new AttachmentBuilder(sticker.url).setName(`sticker_${sticker.id}.png`));
            });
        }

        let editedMessageWarning = `:pencil: Edited message.`;

        const oldMessageEmbedId = getEmbedMessageFromUser(oldMessage.id, modmailChannelId);
        editedMessageWarning += oldMessageEmbedId ? ` [**Original**](https://discord.com/channels/${process.env.GUILD_ID}/${modmailChannelId}/${oldMessageEmbedId})` : ' **Failed to fetch original message.**';

        const toEditReply = await modmailChannel.messages.fetch(oldMessageEmbedId);

        try {
            if (toEditReply) {
                await toEditReply.reply({
                    content: editedMessageWarning,
                    embeds: [embed],
                    ...(files && { files })
                });
            } else {
                await modmailChannel.send({
                    content: editedMessageWarning,
                    embeds: [embed],
                    ...(files && { files })
                });
            }

            await newMessage.react('✏️');
        } catch (err) {
            console.log(`[MODMAIL] Error in sending edit message to ${modmailChannel.id}: ${err}`);
            await newMessage.reply(messages.errors.MESSAGE_NOT_EDITED);
        }
    },
};