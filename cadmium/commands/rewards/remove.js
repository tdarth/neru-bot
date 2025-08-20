const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { removeLevelRole } = require('../../utils/level-roles/removeLevelRole');
const { formatNumber } = require('../../utils/formatNumber');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('remove')
		.setDescription("Removes a role reward")
		.addRoleOption(option => option.setName('role').setDescription('The role to be removed').setRequired(true))
        .addStringOption(option => option.setName('level').setDescription('The level the role is currently at').setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
		const role = interaction.options.getRole('role');
        const level = formatNumber(parseInt(interaction.options.getString('levels'), 10));

        if (isNaN(level)) return interaction.reply(new ContainerMessage(messages.errors.MUST_BE_NUMBER.replaceAll('{argument}', 'amount')).isEphemeral().build());

		await removeLevelRole(interaction.guild.id, role.id, level);
		await interaction.reply(new ContainerMessage(messages.success.ROLE_REWARD_REMOVED.replaceAll('{role}', role.id).replaceAll('{level}', level)).build());
	}
};