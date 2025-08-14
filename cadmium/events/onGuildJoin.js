const { Events } = require('discord.js');
const { servers } = require('../allowed_servers.json');

module.exports = {
    name: Events.GuildCreate,
    once: true,
    async execute(guild) {
        if (!servers.includes(guild.id)) await guild.leave();
    },
};