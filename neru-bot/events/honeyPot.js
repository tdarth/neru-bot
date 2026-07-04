const { Events, MessageFlags, ContainerBuilder, TextDisplayBuilder } = require('discord.js');
const { honeypotChannelId, honeypotRoleId } = require('../config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (message.channel.id != honeypotChannelId) return;

        await message.delete();
        await message.member.roles.add(honeypotRoleId);
    },
};
