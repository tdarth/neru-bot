const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateServerConfig } = require('../../utils/server/updateServerConfig');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('levelup-card-message')
		.setDescription("Sets the message that is sent on the levelup card")
		.addStringOption(option => option.setName('message').setDescription('Placeholders: {user} {xp} {totalXp} {oldLevel} {newLevel}').setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
		const message = interaction.options.getString('message');

		await updateServerConfig(interaction.guild.id, 'level_up_message_card', message);
		await interaction.reply(new ContainerMessage(messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', 'Level Up Card Message').replaceAll('{value}', message)).build());
	}
};