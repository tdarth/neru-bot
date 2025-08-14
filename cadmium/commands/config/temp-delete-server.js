const { SlashCommandSubcommandBuilder } = require('discord.js');
const { deleteServerData } = require('../../utils/server/deleteServerData');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('temp-delete-server')
		.setDescription("deletes server no undo")
		.addStringOption(option => option.setName('server-id').setDescription('The server id').setRequired(true)),
	async execute(interaction) {
        await deleteServerData(interaction.guild.id);
        await interaction.reply(new ContainerMessage('done').build());
	}
};