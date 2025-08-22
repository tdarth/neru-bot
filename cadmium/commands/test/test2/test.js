const { SlashCommandSubcommandBuilder, MessageFlags, ContainerBuilder, MediaGalleryBuilder, TextDisplayBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('ping')
        .setDescription("View the leaderboard of the server"),
    async execute(interaction) {
        await interaction.reply("pong")
    }
};