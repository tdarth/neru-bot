const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateServerConfig } = require('../../utils/server/updateServerConfig');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('level-mode')
		.setDescription("Set the level mode")
		.addStringOption(option =>
			option.setName('mode')
				.setDescription('The leveling mode')
				.setRequired(true)
				.addChoices(
					{ name: 'Fixed Amount', value: 'fixed' },
					{ name: 'Exponential', value: 'multiplied' },
				)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return ContainerMessage(messages.errors.MISSING_PERMISSION.replace('{permission}', 'administrator')).build();
		const mode = interaction.options.getString('mode');

		await updateServerConfig(interaction.guild.id, 'xp_levelup_mode', mode);
		await interaction.reply(new ContainerMessage(messages.success.UPDATE_LEVEL_XP_REQUIREMENT.replace('{mode}', mode))).build();
	}
};