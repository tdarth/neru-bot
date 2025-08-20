const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { addLevelRole } = require('../../utils/level-roles/addLevelRole');
const { formatNumber } = require('../../utils/formatNumber');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('add')
		.setDescription("Adds a role to be given when a level is reached")
		.addRoleOption(option => option.setName('role').setDescription('The role to be given').setRequired(true))
        .addStringOption(option => option.setName('level').setDescription('The level requirement').setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
		const role = interaction.options.getRole('role');
        const level = formatNumber(parseInt(interaction.options.getString('level'), 10));

        if (isNaN(level)) return interaction.reply(new ContainerMessage(messages.errors.MUST_BE_NUMBER.replaceAll('{argument}', 'level')).isEphemeral().build());
        if (interaction.guild.members.me.roles.highest.position <= role.position) return interaction.reply(new ContainerMessage(messages.errors.BOT_ROLE_TOO_LOW.replaceAll('{botRole}', `<@&${interaction.client.user.id}>`).replaceAll('{role}', `<@&${role.id}>`)).isEphemeral().build());

		await addLevelRole(interaction.guild.id, role.id, level);
		await interaction.reply(new ContainerMessage(messages.success.ROLE_REWARD_ADDED.replaceAll('{role}', role.id).replaceAll('{level}', level)).build());
	}
};