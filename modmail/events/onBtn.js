const { Events, MessageFlags, ContainerBuilder, TextDisplayBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { staffRoles } = require('../config.json');
const { messages } = require('../messages.json');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const customId = interaction?.customId || null;

        if (customId.startsWith('deleteChannel_')) {
            try {
                await interaction.deferUpdate();
                await interaction.channel.delete();
            } catch (e) {
                console.error(`[MODMAIL] Error in button interaction: ${e.message}`);
            }
        }

        if (customId == "deleteMe") {
            try {
                await interaction.message.delete();
            } catch (e) {
                console.error(`[MODMAIL] Error in deleteMe button interaction: ${e.message}`);
            }
        }

        if (customId.startsWith('PW_')) {
            await interaction.deferUpdate();

            try {
                await interaction.user.send({
                    content: `${messages.success.PASSWORD_RECEIVED.replaceAll("{password}", customId.replace('PW_', ''))}`,
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`deleteMe`)
                                    .setStyle(ButtonStyle.Secondary)
                                    .setLabel('🗑️')
                            )
                    ]
                });
            } catch {
                await interaction.followUp({
                    flags: MessageFlags.Ephemeral,
                    content: `${messages.errors.PASSWORD_DM_ERROR}`
                });

                return;
            }


            await interaction.followUp({
                flags: MessageFlags.Ephemeral,
                content: `${messages.success.PASSWORD_DM_SUCCESS}`
            });
        }
    },
};