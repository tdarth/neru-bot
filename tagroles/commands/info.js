const { SlashCommandSubcommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('info')
        .setDescription("Shows your profile"),
    async execute(interaction) {
        const cached = interaction.guild.members.cache.size;
        await interaction.reply(`cached: ${cached}`);
    }
};