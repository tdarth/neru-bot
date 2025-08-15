const { SlashCommandSubcommandBuilder } = require('discord.js');
const { updateUserData } = require('../../utils/user/updateUserData');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('bar-color')
		.setDescription("Sets your level card filled bar color for this server")
        .addStringOption(option => option.setName('color').setDescription('Hexadecimal color').setRequired(true)),
	async execute(interaction) {
		const color = interaction.options.getString('color');
        hexMatch = color.match(/^#[0-9A-Fa-f]{6}$/);

        if (!hexMatch) return await interaction.reply(new ContainerMessage(messages.errors.NOT_HEXADECIMAL_COLOR.replaceAll('{input}', 'color')).isEphemeral().build());
        
        updateUserData(interaction.guild.id, interaction.user.id, 'card_bar_color', color);
		await interaction.reply(new ContainerMessage(messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', 'Card Bar Color').replaceAll('{value}', color)).isEphemeral().build());
	}
};