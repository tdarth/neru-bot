const { SlashCommandSubcommandBuilder } = require('discord.js');
const { getXp } = require('../utils/leveling/getXp');
const { messages } = require('../messages.json');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('level')
		.setDescription("View you or a user's level")
		.addUserOption(option => option.setName('member').setDescription('The member to view').setRequired(false)),
	async execute(interaction) {
		const targetId = interaction?.options?.getUser('member')?.id || interaction.user.id;

		const xp = await getXp(interaction.guild.id, targetId);
		if (!xp || xp?.xp <= 0) return await interaction.reply(new ContainerMessage(messages.info.USER_HAS_NO_XP.replace('{user}', `<@${targetId}>`)).build());

		await interaction.reply(new ContainerMessage(messages.info.USER_HAS_XP
			.replace('{user}', `<@${targetId}>`)
			.replace('{amount}', xp.xp.toLocaleString())
			.replace('{total}', xp.totalXp.toLocaleString())
		).build());
	}
};