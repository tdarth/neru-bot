const { SlashCommandSubcommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('ping')
		.setDescription("Check if the bot is functional"),
	async execute(interaction) {
		let totalSeconds = (interaction.client.uptime / 1000);
		let days = Math.floor(totalSeconds / 86400);
		totalSeconds %= 86400;
		let hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		let minutes = Math.floor(totalSeconds / 60);
		let seconds = Math.floor(totalSeconds % 60);

		await interaction.reply(`**Pong!** API: __${interaction.client.ws.ping}ms__, Latency: __${Date.now() - interaction.createdTimestamp}ms__ - Uptime: \`${days}d\`, \`${hours}h\`, \`${minutes}m\`, \`${seconds}s\`.\n> Made by **tdarth_**.`);
	}
};