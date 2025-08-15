const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateServerConfig } = require('../../utils/server/updateServerConfig');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('set-any')
		.setDescription("TEMP Sets any config value")
		.addStringOption(option => option.setName('config').setDescription('Config name').setRequired(true))
        .addStringOption(option => option.setName('value').setDescription('Config value').setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
		const config = interaction.options.getString('config');
        const value = interaction.options.getString('value');

		await updateServerConfig(interaction.guild.id, config, value);
		await interaction.reply(new ContainerMessage(messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', config).replaceAll('{value}', value)).build());
	}
};