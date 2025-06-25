const { Events, MessageFlags, ContainerBuilder, TextDisplayBuilder } = require('discord.js');
const { levelRoles, deletedLinksChannelId } = require('../config.json');
const replyWithText = require('../utils/replyWithText');

const levelRoleIds = Object.entries(levelRoles)
    .filter(([level]) => level !== "10")
    .map(([, roleId]) => roleId);

const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+/gi;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!urlRegex.test(message.content)) return;
        if (levelRoleIds.some(roleId => message.member.roles.cache.has(roleId))) return;

        await message.delete();
        const sentDeletedMessage = await message.client.channels.cache.get(deletedLinksChannelId).send({ content: message.content });
        await sentDeletedMessage.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`Sent by \`${message.author.id}\` in <#${message.channel.id}>. <@${message.author.id}>`))],
            allowedMentions: { parse: [] }
        });
    },
};