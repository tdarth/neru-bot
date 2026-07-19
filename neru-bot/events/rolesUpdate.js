const { Events, MessageFlags, PermissionsBitField, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('discord.js');
const { levelRoles, customRoleRequestChannelId } = require('../config.json');
const { customRoles } = require('../utils/crHelper');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        if (message.author.bot) return;
        if (oldMember.roles.cache.size !== newMember.roles.cache.size) return;

        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        if (removedRoles.includes(levelRoles[100]) && customRoles[newMember.id].has_role) {
            try {
                await newMember.guild.roles.remove(customRoles[newMember.id].role_id);
            } catch (e) {
                const channel = await newMember.guild.channels.fetch(customRoleRequestChannelId);
                await channel.send(`:warning: <@990500436047982602> **Failed to delete Custom Role after user stopped boosting**: <@${newMember.id}> <@&${customRoles[newMember.id].role_id}>`);
            }
        }
    },
};
