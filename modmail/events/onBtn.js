const { Events, MessageFlags, ContainerBuilder, TextDisplayBuilder } = require('discord.js');
const { staffRoles } = require('../config.json');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const customId = interaction?.customId || null;

        if (customId.startsWith('deleteChannel_')) {
            try {
                await interaction.deferUpdate();
                await interaction.channel.delete();
            } catch (err) {
                console.error(`[MODMAIL] Error in button interaction: ${err.message}`);
            }
        }

        if (customId.startsWith('PW_')) {
            await interaction.deferUpdate();
            await interaction.followUp({
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`\`\`\`${customId.replace('PW_', '')}\`\`\``)
                        )
                ]
            })
        }
    },
};