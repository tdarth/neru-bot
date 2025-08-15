const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { getServerConfig } = require('../../utils/server/getServerConfig');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('view')
		.setDescription("View the server's config"),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).build());

		const config = await getServerConfig(interaction.guild.id);
		await interaction.reply(new ContainerMessage(`${JSON.stringify(config)}`).build());
	}
};