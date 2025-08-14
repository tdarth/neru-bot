const { SlashCommandSubcommandBuilder } = require('discord.js');
const { deleteServerData } = require('../../utils/server/deleteServerData');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('level-xp-required')
		.setDescription("Set the required level xp")
		.addStringOption(option => option.setName('server-id').setDescription('The server id').setRequired(true)),
	async execute(interaction) {
        await deleteServerData(interaction.guild.id);
        await interaction.reply(new ContainerMessage('done').build());
	}
};