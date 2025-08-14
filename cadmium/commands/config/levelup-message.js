const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateServerConfig } = require('../../utils/server/updateServerConfig');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('levelup-message')
		.setDescription("Sets the message that is sent on levelup")
		.addStringOption(option => option.setName('message').setDescription('The message. Placeholders: {user} {xp} {totalXp} {oldLevel} {newLevel}').setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).build());
		const message = interaction.options.getString('message');

		await updateServerConfig(interaction.guild.id, 'level_up_message', message);
		await interaction.reply(new ContainerMessage(messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', 'Level Up Message').replaceAll('{value}', message)).build());
	}
};