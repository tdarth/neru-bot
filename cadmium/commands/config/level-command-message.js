const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateServerConfig } = require('../../utils/server/updateServerConfig');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('level-command-message')
		.setDescription("Sets the message that is sent on /level, along with the card if enabled")
		.addStringOption(option => option.setName('message').setDescription('The message. Placeholders: {user} {userId} {username} {displayname} {level} {xp} {nextLevelXp} {totalXp}').setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
		const message = interaction.options.getString('message');

		await updateServerConfig(interaction.guild.id, 'level_command_message', message);
		await interaction.reply(new ContainerMessage(messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', 'Level Command Message').replaceAll('{value}', message)).build());
	}
};