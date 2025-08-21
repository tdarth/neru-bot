const fs = require('fs').promises;
const path = require('path');
const { initServerData } = require('../db/initServer');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        try {
            const filePath = path.join(__dirname, '../allowed_servers.json');
            const data = await fs.readFile(filePath, 'utf8');
            const json = JSON.parse(data);
            const servers = json.servers;

            if (!servers.includes(guild.id)) {
                const owner = await guild.client.users.fetch(guild.ownerId);

                try {
                    await owner.send(
                        new ContainerMessage(
                            `:wave: Hi **${owner.username}**,\n*Cadmium* is currently whitelist-only, meaning only approved servers can add the bot.\n-# Please message <@990500436047982602> (\`tdarth_\`) for more information.`
                        ).build()
                    );
                } catch (err) {
                    console.log('[CADMIUM] Owner DM failed.');
                }

                await guild.leave();
                console.log(
                    `[CADMIUM] Left guild ${guild.name} (${guild.id}) (${guild.memberCount} members) (${guild.ownerId} Owner ID), not on whitelist.`
                );
            }

            await initServerData(guild.id);
        } catch (err) {
            console.error('[CADMIUM] Failed to read allowed_servers.json:', err);
        }
    },
};