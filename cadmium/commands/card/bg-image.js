const { SlashCommandSubcommandBuilder } = require('discord.js');
const { updateUserData } = require('../../utils/user/updateUserData');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('bg-image')
		.setDescription("Sets your background image")
        .addStringOption(option => option.setName('image-link').setDescription('Image link').setRequired(true)),
	async execute(interaction) {
		const image = interaction.options.getString('image-link');

        updateUserData(interaction.guild.id, interaction.user.id, 'card_bg_image', image);
		await interaction.reply(new ContainerMessage(messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', 'Card Image').replaceAll('{value}', image)).build());
	}
};