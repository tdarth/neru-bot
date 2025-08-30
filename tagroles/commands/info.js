const { SlashCommandSubcommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('info')
        .setDescription("Shows your profile"),
    async execute(interaction) {
        await interaction.reply(`hi\n${interaction.user.primaryGuild.tag}\n${interaction.user.primaryGuild.badge}\n${interaction.user.primaryGuild.identityGuildId}`);

        const cached = interaction.guild.members.cache.size;
        await interaction.reply(`cached: ${cached}`);
    }
};