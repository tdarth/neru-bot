const { Events } = require('discord.js');
const { staffRoles } = require('../config.json');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("deleteChannel_")) {
            try {
                await interaction.deferUpdate();
                await interaction.channel.delete();
            } catch (err) {
                console.error(`[MODMAIL] Error in button interaction: ${err.message}`);
            }
        }
    },
};