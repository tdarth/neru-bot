const { Events, MessageFlags, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder } = require('discord.js');
const { staffRoles } = require('../config.json');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === "markAsResolved_button") {
            try {
                await interaction.deferUpdate();

                await interaction.message.reply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent("## :white_check_mark: Report Resolved")
                            )
                            .addSeparatorComponents(new SeparatorBuilder())
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(`-# Marked resolved by <@${interaction.user.id}> on <t:${Math.floor(Date.now() / 1000)}:f>.`)
                            )
                    ]
                });
            } catch (err) {
                console.error(`Error in button interaction: ${err.message}`);
            }
        }

        if (interaction.customId === 'private_button') {
            if (interaction.member.roles.cache.some(role => staffRoles.includes(role.id))) {
                await interaction.deferUpdate();
                const members = await interaction.channel.members.fetch();

                for (const [id] of members) {
                    interaction.channel.members.remove(id);
                }

                await interaction.channel.setName(`[LOCKED] ${interaction.channel.name}`);
                await interaction.channel.setLocked(true);
            } else {
                await interaction.reply({
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(':x: **Only the moderator can close this thread.**')
                            )
                    ]
                });
            }
        }
    },
};
