const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || message.content.toLowerCase() !== "job") return;
        await message.reply({ stickers: message.client.guilds.cache.get(message.guild.id).stickers.cache.filter(s => s.id === "1373482200602771486") });
    },
};