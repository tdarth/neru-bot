const { Events, MessageFlags, ContainerBuilder, TextDisplayBuilder } = require('discord.js');
const { honeypotChannelId, staffRoles } = require('../config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (message.channel.id != honeypotChannelId) return;
        if (message.member.roles.cache.some(role => staffRoles.includes(role.id))) {
            return await message.delete();
        }

        await message.author.send(`:warning: You were banned for **1 second** under a bot account suspicion.`);
        await message.member.ban( { deleteMessageSeconds: 60, reason: "Triggered honeypot" } );

        setTimeout(async () => {
            try {
                await message.interaction.guild.bans.remove(message.member.id);
            } catch (e) {
                const channel = message.interaction.guild.channels.cache.get('1369790374234820618');
                await channel.send(`<@990500436047982602>, honeypot failed to unban: ${member.id}`);
            }
        }, 2000);
    },
};
