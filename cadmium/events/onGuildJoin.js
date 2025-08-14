const { Events } = require('discord.js');
const { servers } = require('../allowed_servers.json');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        if (!servers.includes(guild.id)) {
            console.log(`[CADMIUM] Left ${guild.name} (${guild.id}), not on whitelist.`);
            await guild.leave();
        }
    },
};