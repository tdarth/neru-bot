const { SlashCommandSubcommandBuilder } = require('discord.js');
const { listLevelRoles } = require('../../utils/level-roles/listLevelRoles');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('list')
		.setDescription("Lists all current level rewards"),
	async execute(interaction) {
		const roles = await listLevelRoles(interaction.guild.id);

		await interaction.reply(new ContainerMessage(roles.map(r => `\`${r.level}\`: <@&${r.roleId}>`)
			.join('\n') || messages.errors.NO_LEVEL_ROLES).build());
	}
};