const { SlashCommandSubcommandBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder } = require('discord.js');
const { getXp } = require('../utils/leveling/getXp');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('level')
		.setDescription("View you or a user level")
		.addStringOption(option => option.setName('id').setDescription('The user id').setRequired(true)),
	async execute(interaction) {
		const id = interaction.options.getString('id');
		const xp = await getXp(interaction.guild.id, id);
		if (!xp) {
			return await interaction.reply(new ContainerMessage(`<@${id}> has no XP.`));
		}

		await interaction.reply(new ContainerMessage(
			`<@${id}>'s XP: ${xp.xp}, Total XP: ${xp.totalXp}`
		));
	}
};