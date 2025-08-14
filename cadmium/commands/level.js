const { SlashCommandSubcommandBuilder } = require('discord.js');
const { getLevel } = require('../utils/leveling/getLevel');
const { messages } = require('../messages.json');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('level')
		.setDescription("View you or a user's level")
		.addUserOption(option => option.setName('member').setDescription('The member to view').setRequired(false)),
	async execute(interaction) {
		const targetId = interaction?.options?.getUser('member')?.id || interaction.user.id;

		const level = await getLevel(interaction.guild.id, targetId);
		if (!level.xp && level.level != 0) return await interaction.reply(new ContainerMessage(messages.info.USER_HAS_NO_XP.replace('{user}', `<@${targetId}>`)).build());

		await interaction.reply(new ContainerMessage(messages.info.USER_HAS_XP
			.replace('{user}', `<@${targetId}>`)
			.replace('{level}', level.level.toLocaleString())
			.replace('{xp}', level.xp.toLocaleString())
			.replace('{nextLevelXp}', level.nextLevelXp.toLocaleString())
			.replace('{totalXp}', level.totalXp.toLocaleString())
		).build());
	}
};