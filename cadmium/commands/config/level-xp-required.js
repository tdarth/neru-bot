const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateServerConfig } = require('../../utils/server/updateServerConfig');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('level-xp-required')
		.setDescription("Set the required level xp")
		.addStringOption(option => option.setName('requirement').setDescription('The amount of xp to require').setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
		const requirement = interaction.options.getString('requirement');

		await updateServerConfig(interaction.guild.id, 'xp_levelup_amount', requirement);
		await interaction.reply(new ContainerMessage(messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', 'Levelup XP Amount').replaceAll('{value}', requirement)).build());
	}
};