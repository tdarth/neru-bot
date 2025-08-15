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
		const targetUser = interaction?.options?.getUser('member') || interaction.user;

		if (targetUser.bot) return await interaction.reply(new ContainerMessage(messages.errors.CANNOT_LEVELCHECK_BOT).build());

		const level = await getLevel(interaction.guild.id, targetUser.id);
		if ((level.xp == 0 || level.xp == null) && level.level == 0) return await interaction.reply(new ContainerMessage(messages.info.USER_HAS_NO_XP.replace('{user}', `<@${targetUser.id}>`)).build());

		await interaction.reply(new ContainerMessage(messages.info.USER_HAS_XP
			.replaceAll('{user}', `<@${targetUser.id}>`)
			.replaceAll('{level}', level.level.toLocaleString())
			.replaceAll('{xp}', level.xp.toLocaleString())
			.replaceAll('{nextLevelXp}', level.nextLevelXp.toLocaleString())
			.replaceAll('{totalXp}', level.totalXp.toLocaleString())
		).build());
	}
};