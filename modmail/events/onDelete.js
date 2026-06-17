const { Events, ChannelType, EmbedBuilder, ThreadAutoArchiveDuration, MessageFlags, ContainerBuilder, TextDisplayBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { getChannelByUser, addUserToChannel, clearChannel, isUserBanned, getEmbedMessageFromUser } = require('../db/utils/helper');
const { getChannelFromId } = require('../utils/getChannelFromId');
const { messages } = require('../messages.json');
const { modmailCategoryId, modmailChannelForThreadId, modmailChannelType, modmailPingStaffOnCreation, staffRoles, modmailWelcomeMessage, modmailShowUserTypingIndicators, modmailUserTypingIndicatorsFetchCount, modmailUseBuiltInTypingIndicators } = require('../config.json');
const { formatUser } = require('../utils/formatUser');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (message.channel.type !== ChannelType.DM) return;
        if (message.author.bot) return;

        const client = message.client;
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        const author = message.author;

        let modmailChannelId = await getChannelByUser(process.env.GUILD_ID, author.id);
        let modmailChannel;

        if (modmailChannelId) {
            modmailChannel = await getChannelFromId(client, modmailChannelId);
        }

        if (!modmailChannel) {
            console.log(`[MODMAIL] Delete message: Unable to fetch channel for user ${author.id}`);
            return;
        }

        let deletedMessageWarning = `:wastebasket: The user deleted this message.`;

        const oldMessageEmbedId = await getEmbedMessageFromUser(message.id, modmailChannelId);
        deletedMessageWarning += oldMessageEmbedId ? ` [**Original**](https://discord.com/channels/${process.env.GUILD_ID}/${modmailChannelId}/${oldMessageEmbedId})` : ' **Failed to fetch original message.**';

        const toEditReply = await modmailChannel.messages.fetch(oldMessageEmbedId);

        try {
            if (toEditReply) {
                await toEditReply.reply({
                    content: deletedMessageWarning
                });
            } else {
                await modmailChannel.send({
                    content: deletedMessageWarning
                });
            }
        } catch (err) {
            console.log(`[MODMAIL] Error in sending delete message to ${modmailChannel.id}: ${err}`);
        }
    },
};