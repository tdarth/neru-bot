const { Events, ChannelType, EmbedBuilder, ThreadAutoArchiveDuration, MessageFlags, ContainerBuilder, TextDisplayBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { getUserByChannel, getEmbedMessageFromUser } = require('../db/utils/helper');
const { getDiscUserById } = require('../utils/getDiscUserById');
const { getChannelFromId } = require('../utils/getChannelFromId');
const { messages } = require('../messages.json');
const { prefixes, modmailChannelType, associateMessageToEmbed } = require('../config.json');
const { formatUser } = require('../utils/formatUser');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (modmailChannelType == 0 && message.channel.type !== ChannelType.GuildText) return;
        if (modmailChannelType == 1 && message.channel.type !== ChannelType.PrivateThread) return;
        if (!message.channel.name.includes('modmail')) return;
        if (message.author.bot) return;
        if (message.content.startsWith(prefixes.IGNORE)) return;

        const userId = message?.channel?.topic || await getUserByChannel(message.guild.id, message.channel.id) || null;

        if (userId) {
            const user = await getDiscUserById(message.client, userId) || null;
            if (!user) return;

            const oldMessageEmbedId = await getEmbedMessageFromUser(message.id, message.channel.id);
            const dmChannel = await user.createDM();

            const toDelete = await dmChannel.messages.fetch(oldMessageEmbedId);

            try {
                await toDelete.delete();
            } catch (err) {
                console.log(`[MODMAIL] Error in deleting message to ${user.id}: ${err}`);
                await message.channel.send(messages.errors.MM_MSG_NOT_DELETED_FOR_USER.replaceAll("{user}", `<@${message.user.id}>`));
            }
        }
    },
};