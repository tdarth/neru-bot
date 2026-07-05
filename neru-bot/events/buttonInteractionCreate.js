const { Events, MessageFlags, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder } = require('discord.js');
const { staffRoles, honeypotRoleId, levelRoles } = require('../config.json');
const replyWithText = require('../utils/replyWithText');

const appRoles = [levelRoles[15], levelRoles[30], levelRoles[40], levelRoles[50], levelRoles[75], levelRoles[100]];
const blacklistRoles = [...staffRoles, "1382053615102857337"]

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === "staffAppAccept_button") {
            await interaction.message.edit({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent("### :white_check_mark: Application Accepted")
                        )
                ]
            });
        }

        if (interaction.customId === "staffAppDeny_button") {
            await interaction.message.edit({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent("### :x: Application Denied")
                        )
                ]
            });
        }

        if (interaction.customId === "staffApp_button") {
            if (interaction.member.roles.cache.some(role => blacklistRoles.includes(role.id))) return interaction.reply({
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(":x: **You cannot use this.** (Already staff or blacklisted.)")
                        )
                ]
            })

            if (!interaction.member.roles.cache.some(role => appRoles.includes(role.id))) return interaction.reply({
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(":x: **Level 15** is required to apply for Staff.")
                        )
                ]
            })

            const modal = new ModalBuilder().setCustomId('staffApp').setTitle('Staff Application');

            const infoInput = new TextInputBuilder()
                .setCustomId('staffInfo')
                .setStyle(TextInputStyle.Short)

            const infoLabel = new LabelBuilder()
                .setLabel("Age / Timezone / Server Activity")
                .setDescription("Please list all 3 in your response. \"Server Activity\" can be a number from 1-10.")
                .setTextInputComponent(infoInput)

            const whyInput = new TextInputBuilder()
                .setCustomId('staffWhy')
                .setStyle(TextInputStyle.Paragraph)

            const whyLabel = new LabelBuilder()
                .setLabel("Why do you want to become a moderator?")
                .setTextInputComponent(whyInput)

            const exInput = new TextInputBuilder()
                .setCustomId('staffEx')
                .setStyle(TextInputStyle.Paragraph)

            const exLabel = new LabelBuilder()
                .setLabel("Please list past moderation experience.")
                .setDescription("(If any). Include your position and contributions.")
                .setTextInputComponent(exInput)
                
            const bcInput = new TextInputBuilder()
                .setCustomId('staffBc')
                .setStyle(TextInputStyle.Paragraph)

            const bcLabel = new LabelBuilder()
                .setLabel("What makes you the best candidate?")
                .setTextInputComponent(bcInput)

            const swInput = new TextInputBuilder()
                .setCustomId('staffSw')
                .setStyle(TextInputStyle.Paragraph)

            const swLabel = new LabelBuilder()
                .setLabel("What's a strength and weakness of yours?")
                .setDescription("Please also use this field to tell us anything else you would like us to know.")
                .setTextInputComponent(swInput)

            modal
                .addLabelComponents(infoLabel, whyLabel, exLabel, bcLabel, swLabel);

            await interaction.showModal(modal);
        }

        if (interaction.customId === "unhoneypot") {
            await interaction.deferUpdate();
            await interaction.member.roles.remove(honeypotRoleId);
        }

        if (interaction.customId === "markAsResolved_button") {
            try {
                await interaction.deferUpdate();

                await interaction.message.reply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent("## :white_check_mark: Report Handled")
                            )
                            .addSeparatorComponents(new SeparatorBuilder())
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(`-# Claimed by <@${interaction.user.id}> on <t:${Math.floor(Date.now() / 1000)}:f>.`)
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
