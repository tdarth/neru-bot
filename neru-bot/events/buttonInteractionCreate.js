const { Events, MessageFlags, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { staffRoles, honeypotRoleId, levelRoles, customRoleAboveRoleId } = require('../config.json');
const { customRoles, setCustomRoleEntry, deleteCustomRoleEntry } = require('../utils/crHelper');
const replyWithText = require('../utils/replyWithText');

const appRoles = [levelRoles[15], levelRoles[30], levelRoles[40], levelRoles[50], levelRoles[75], levelRoles[100]];
const blacklistRoles = [...staffRoles, "1382053615102857337"]

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId == "cancel") {
            await interaction.deferUpdate();
            await interaction.deleteReply();
        }


        if (interaction.customId.startsWith("crDeny_button")) {
            await interaction.reply({
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent("**Are you sure you want to deny?**\nThe user will be notified of this action.")
                        )
                        .addActionRowComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(interaction.customId.replace("crDeny", "crDeny2"))
                                        .setLabel("Confirm")
                                        .setStyle(ButtonStyle.Success),
                                    new ButtonBuilder()
                                        .setCustomId("cancel")
                                        .setLabel("Cancel")
                                        .setStyle(ButtonStyle.Danger)
                                )
                        )
                ]
            })
        }

        if (interaction.customId.startsWith("crAccept_button")) {
            await interaction.reply({
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent("**Are you sure you want to accept?**\nThe user will be notified of this action.\nThis will also automatically create and apply the role to the user.")
                        )
                        .addActionRowComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(interaction.customId.replace("crAccept", "crAccept2"))
                                        .setLabel("Confirm")
                                        .setStyle(ButtonStyle.Success),
                                    new ButtonBuilder()
                                        .setCustomId("cancel")
                                        .setLabel("Cancel")
                                        .setStyle(ButtonStyle.Danger)
                                )
                        )
                ]
            })
        }

        if (interaction.customId.startsWith("crDeny2_button")) {
            await interaction.deferUpdate();

            const userId = interaction.customId.split(":")[1];

            let dmStatus = false;

            deleteCustomRoleEntry(userId);

            try {
                const userToDm = await interaction.client.users.fetch(userId);

                await userToDm.send({
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(":x: **Sorry!**\nYour Custom Role request was denied. You may make another request, but please make sure it follows our rules.")
                            )
                    ]
                });

                dmStatus = true;
            } catch (e) {

            }

            const buttonMsg = await interaction.message.channel.messages.fetch(interaction.message.reference.messageId);

            await buttonMsg.edit({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    buttonMsg.components[0],
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`### :x: Request Denied${dmStatus ? "" : " (failed to DM)"}`)
                        )
                ]
            });

            await interaction.deleteReply();
        }

        if (interaction.customId.startsWith("crAccept2_button")) {
            await interaction.deferUpdate();

            const userId = interaction.customId.split(":")[1];

            let dmStatus = false;

            try {
                const userToDm = await interaction.client.users.fetch(userId);

                await userToDm.send({
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(":white_check_mark: **Congratulations!**\nYour Custom Role request was approved. If you don't have it, please open a ticket.")
                            )
                    ]
                });

                dmStatus = true;
            } catch (e) {

            }

            try {
                const roleInfo = customRoles[userId];

                const roleColors = {}

                roleColors['primaryColor'] = JSON.parse(roleInfo.color)[0];

                if (roleInfo.color.length >= 2) {
                    roleColors['secondaryColor'] = JSON.parse(roleInfo.color)[1];

                }

                const newRole = await interaction.guild.roles.create({
                    name: roleInfo.name,
                    colors: roleColors,
                    // icon: roleInfo.image,
                    permissions: [],

                    reason: `Custom role for ${userId}`,
                });

                const roleBelow = await interaction.guild.roles.fetch(customRoleAboveRoleId);
                const insertPoint = roleBelow.position;

                await interaction.guild.roles.setPosition(newRole, insertPoint)

                const member = await interaction.guild.members.fetch(userId);

                await member.roles.add(newRole);

                setCustomRoleEntry(userId, { has_role: true, role_id: newRole.id, name: roleInfo.name });
            } catch (e) {
                await interaction.channel.send(`:warning: <@990500436047982602> **Role failed to create**: ${e}`);
                console.log(`[NERU] Custom role failed to create: ${e}`);
            }

            const buttonMsg = await interaction.message.channel.messages.fetch(interaction.message.reference.messageId);

            await buttonMsg.edit({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    buttonMsg.components[0],
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`### :white_check_mark: Request Accepted${dmStatus ? "" : " (failed to DM)"}`)
                        )
                ]
            });

            await interaction.deleteReply();
        }

        if (interaction.customId.startsWith("staffAppAccept_button")) {
            await interaction.reply({
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent("**Are you sure you want to accept?**\nThe user will be notified of this action.")
                        )
                        .addActionRowComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(interaction.customId.replace("staffAppAccept", "staffAppAccept2"))
                                        .setLabel("Confirm")
                                        .setStyle(ButtonStyle.Success),
                                    new ButtonBuilder()
                                        .setCustomId("cancel")
                                        .setLabel("Cancel")
                                        .setStyle(ButtonStyle.Danger)
                                )
                        )
                ]
            })
        }

        if (interaction.customId.startsWith("staffAppAccept2_button")) {
            await interaction.deferUpdate();

            const userId = interaction.customId.split(":")[1];

            let dmStatus = false;

            try {
                const userToDm = await interaction.client.users.fetch(userId);

                await userToDm.send({
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(":pencil: **Congratulations!**\nYour staff application was accepted.")
                            )
                    ]
                });

                dmStatus = true;
            } catch (e) {

            }

            const buttonMsg = await interaction.message.channel.messages.fetch(interaction.message.reference.messageId);

            await buttonMsg.edit({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`### :white_check_mark: Application Accepted${dmStatus ? "" : " (failed to DM)"}`)
                        )
                ]
            });

            await interaction.deleteReply();
        }

        if (interaction.customId === "staffAppDeny2_button") {
            await interaction.deferUpdate();

            const buttonMsg = await interaction.message.channel.messages.fetch(interaction.message.reference.messageId);

            await buttonMsg.edit({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`### :x: Application Denied`)
                        )
                ]
            });

            await interaction.deleteReply();
        }

        if (interaction.customId === "staffAppDeny_button") {
            await interaction.reply({
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent("**Are you sure you want to deny?**")
                        )
                        .addActionRowComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId("staffAppDeny2_button")
                                        .setLabel("Confirm")
                                        .setStyle(ButtonStyle.Success),
                                    new ButtonBuilder()
                                        .setCustomId("cancel")
                                        .setLabel("Cancel")
                                        .setStyle(ButtonStyle.Danger)
                                )
                        )
                ]
            })
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
