const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateServerConfig } = require('../../utils/server/updateServerConfig');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('stack-rewards')
        .setDescription("Toggles if past level roles should be given, or the highest only")
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('The leveling mode')
                .setRequired(true)
                .addChoices(
                    { name: 'All Roles Given', value: 'all' },
                    { name: 'Highest Role Only', value: 'only' },
                )),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
        const mode = interaction.options.getString('mode');
        const configChange = (mode == 'all') ? '1' : '0';

        await updateServerConfig(interaction.guild.id, 'stack_level_roles_enabled', configChange);
        await interaction.reply(new ContainerMessage(messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', 'Stack Level Roles').replaceAll('{value}', configChange)).build());
    }
};