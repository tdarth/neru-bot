const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateServerConfig } = require('../../utils/server/updateServerConfig');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('level-command-card-visibility')
        .setDescription("Toggles if the level card is shown in /level")
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('The level card visibility')
                .setRequired(true)
                .addChoices(
                    { name: 'Show', value: 'show' },
                    { name: 'Hide', value: 'hide' },
                )),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
        const mode = interaction.options.getString('mode');
        const configChange = (mode == 'show') ? '1' : '0';

        await updateServerConfig(interaction.guild.id, 'level_command_card_enabled', configChange);
        await interaction.reply(new ContainerMessage(messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', 'Level Up Command Visibility').replaceAll('{value}', mode)).build());
    }
};