const { SlashCommandSubcommandBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { messages } = require('../messages.json');
const { songs } = require('../songs.json')
const { users } = require('../users.json')
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('setup')
        .setDescription('Creates channels'),
    async execute(interaction) {
        if (interaction?.user?.id != interaction?.guild?.ownerId) return await interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSIONS.replace('{0}', 'SERVER_OWNER')).isEphemeral().build());

        await interaction.reply({
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('# VocaVote')
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`:warning: Please confirm the following:\n> \`${songs.length}\` channels will be created.\n> \`${users.voters.length}\` voters.\n**This action cannot be undone.**`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                    )
                    .addActionRowComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('setup_confirm')
                                    .setLabel('Confirm')
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId('setup_cancel')
                                    .setLabel('Cancel')
                                    .setStyle(ButtonStyle.Secondary)
                            )
                    )
            ]
        })
    }
};