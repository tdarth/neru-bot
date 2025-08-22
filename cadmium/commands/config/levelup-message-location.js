const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateServerConfig } = require('../../utils/server/updateServerConfig');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('levelup-message-location')
        .setDescription("Sets the location to send the level up message")
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Send in the current or external channel')
                .setRequired(true)
                .addChoices(
                    { name: 'Current Channel', value: 'current' },
                    { name: 'External Channel', value: 'external' },
                ))
        .addChannelOption(option => option.setName('channel').setDescription('The channel to send level up message').setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
        const mode = interaction.options.getString('mode');
        const channel = interaction?.options?.getChannel('channel');
        let configChange;

        if (mode == 'current') configChange = '1';
        else if (mode == 'external' && channel) configChange = channel.id;
        else return await interaction.reply(new ContainerMessage(messages.errors.NEED_TO_PASS_CHANNEL.replaceAll('{expected}', mode).replaceAll('{required}', 'channel')).isEphemeral().build());

        await updateServerConfig(interaction.guild.id, 'level_up_message_location', configChange);
        await interaction.reply(new ContainerMessage(messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', 'Level Up Message Location').replaceAll('{value}', mode)).build());
    }
};