const { Events, MessageFlags, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === "markAsResolved_button") {
            await interaction.message.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("## :white_check_mark: Report Resolved")).addSeparatorComponents(new SeparatorBuilder()).addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Marked resolved by <@${interaction.user.id}> on <t:${Math.floor(Date.now() / 1000)}:f>.`))]
            });
            
            await interaction.deferUpdate();
        }
    },
};
