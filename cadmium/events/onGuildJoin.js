const { Events } = require('discord.js');
const { servers } = require('../allowed_servers.json');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        if (!servers.includes(guild.id)) {
            const owner = await guild.client.users.fetch(guild.ownerId);

            try {
                await owner.send(new ContainerMessage(`:wave: Hi **${owner.username}**!\n*Cadmium* is currently whitelist-only, meaning only approved servers can add the bot. Please message <@990500436047982602> (\`tdarth_\`) for more information.`).build())
            } catch (err) {
                console.log('[CADMIUM] Owner DM failed.');
            }

            await guild.leave();
            console.log(`[CADMIUM] Left guild ${guild.name} (${guild.id}) (${guild.memberCount} members) (${guild.ownerId} Owner ID), not on whitelist.`);
        }
    },
};