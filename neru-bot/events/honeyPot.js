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

        await message.author.send(`:warning: **You were kicked for triggering an anti-bot detection.**\nYou can join back here: https://discord.gg/szGWR6D7AN`);
        await message.member.ban({ deleteMessageSeconds: 60, reason: "Triggered honeypot" });

        const guild = message.guild;
        const userId = message.author.id;

        setTimeout(async () => {
            try {
                await guild.bans.remove(userId);
            } catch (e) {
                const channel = guild.channels.cache.get('1369790374234820618');

                if (channel) await channel.send(`<@990500436047982602>, failed to unban ${userId}: ${e.message}`);
            }
        }, 2000);
    },
};
