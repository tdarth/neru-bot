const { Events, MessageFlags, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, SectionBuilder, ThumbnailBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { modApplicationsChannelId } = require('../config.json');
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

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

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
