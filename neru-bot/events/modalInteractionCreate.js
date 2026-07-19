const { Events, MessageFlags, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, SectionBuilder, ThumbnailBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, FileBuilder } = require('discord.js');
const { modApplicationsChannelId, customRoleRequestChannelId } = require('../config.json');
const { setCustomRoleEntry } = require('../utils/crHelper');
const replyWithText = require('../utils/replyWithText');
const splitIntoChunks = require('../utils/splitIntoChunks');

const questions = [
    "Age / Timezone / Server Activity",
    "Why do you want to become a moderator?",
    "Please list past moderation experience.",
    "What makes you the best candidate?",
    "What's a strength and weakness of yours? (and anything else you'd like us to know)"
]

const fields = [
    "Info",
    "Why",
    "Ex",
    "Bc",
    "Sw"
]

const hexRegex = /^#[0-9A-Fa-f]{6}(?:,#[0-9A-Fa-f]{6})?$/;

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === 'roleEdit') {
            const channel = await interaction.client.channels.fetch(customRoleRequestChannelId);

            const roleName = interaction.fields.getTextInputValue('crName');
            const roleColor = interaction.fields.getTextInputValue('crColor').replaceAll(' ', '').split(",");
            const roleIcon = interaction.fields.getUploadedFiles('crIcon').first();
            const acceptedRules = interaction.fields.getCheckbox('crRules');

            if (roleIcon.size > 262143 || !['image/jpeg', 'image/png'].includes(roleIcon.contentType) || !acceptedRules || !hexRegex.test(roleColor.join(",")) || roleName.length > 100) {
                console.log('[NERU] Custom role file failed validation');
                return;
            };

            const response = await fetch(roleIcon.url);

            if (!response.ok) return;

            const arrayBuffer = await response.arrayBuffer();

            const buffer = Buffer.from(arrayBuffer);
            const rawBase64 = buffer.toString("base64");
            const base64 = `data:image/${roleIcon.contentType.replace('image/', '')};base64,${rawBase64}`

            const responseIh = await fetch(`${process.env.IMAGE_HOST}/upload`, {
                method: "POST",
                body: JSON.stringify({
                    base64: base64,
                    apiKey: process.env.IMAGE_HOST_API_KEY
                })
            })

            if (!responseIh.ok) return await interaction.reply({
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(":x: An error occurred. Please open a ticket and ping <@990500436047982602>.")
                        )
                ]
            })

            const dataIh = await responseIh.json();

            setCustomRoleEntry(interaction.user.id, { in_progress: true, name: roleName, color: JSON.stringify(roleColor), image: base64 });

            const headerContainer = new ContainerBuilder()
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# <@${interaction.user.id}>'s Custom Role\n> **User ID:** ${interaction.user.id}\n\n:pencil2: **Role Name**: \`${roleName}\`\n:rainbow: **Role Color**: ${roleColor.length >= 2 ? `Gradient - \`${roleColor[0]}\` to \`${roleColor[1]}\`` : `\`${roleColor[0]}\``}`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder().setURL(`https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`)
                        )
                );

            const footerContainer = new ContainerBuilder()
                .addActionRowComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`crAccept_button:${interaction.user.id}`)
                                .setLabel("Accept")
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(`crDeny_button:${interaction.user.id}`)
                                .setLabel("Deny")
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setURL(dataIh.url)
                                .setLabel("Role Image")
                        )
                )

            await channel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    headerContainer,
                    footerContainer
                ]
            });

            await interaction.reply({
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(":white_check_mark: **Your Custom Role request was submitted!**\n-# > If your DMs are enabled, you will receive one when it's reviewed.")
                        )
                ]
            })
        }

        if (interaction.customId === 'staffApp') {
            let appString = "";

            const accountCreation = Math.floor(interaction.user.createdTimestamp / 1000) || null;
            const memberLength = Math.floor(interaction.member.joinedTimestamp / 1000);

            const channel = await interaction.client.channels.fetch(modApplicationsChannelId);

            for (const field of fields) {
                const response = interaction.fields.getTextInputValue(`staff${field}`);
                appString += `-# **${questions[fields.indexOf(field)]}**\n${response}\n\n`
            }

            const headerContainer = new ContainerBuilder()
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# <@${interaction.user.id}>'s Application\n> :hourglass: **Account Creation:** <t:${accountCreation}:f> (<t:${accountCreation}:R>)\n> :arrow_forward: **Joined:** <t:${memberLength}:f> (<t:${memberLength}:R>)\n-# **User ID:** ${interaction.user.id}`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder().setURL(`https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`)
                        )
                );

            const chunks = splitIntoChunks(appString, 3900);

            await channel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    headerContainer,
                    new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(chunks[0]))
                ],
                allowedMentions: { parse: [] }
            });

            for (let i = 1; i < chunks.length; i++) {
                await channel.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [
                        new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(chunks[i]))
                    ],
                    allowedMentions: { parse: [] }
                });
            }

            const footer = await channel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder()
                        .addActionRowComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`staffAppAccept_button:${interaction.user.id}`)
                                        .setLabel("Accept")
                                        .setStyle(ButtonStyle.Success),
                                    new ButtonBuilder()
                                        .setCustomId("staffAppDeny_button")
                                        .setLabel("Deny")
                                        .setStyle(ButtonStyle.Danger)
                                )
                        )
                ]
            })

            await footer.react("✅");
            await footer.react("❌");

            await interaction.reply({
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(":white_check_mark: **Your application was submitted!**\n-# > Please don't ask for your application to be reviewed. You will only receive a response back if you were accepted.")
                        )
                ]
            })
        }
    },
};
