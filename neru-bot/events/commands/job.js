module.exports = {
    name: 'job',
    trigger: (message) => message.content.toLowerCase().replaceAll(' leek', '').replaceAll(' baguette', '') == 'job',
    async execute(message) {
        await message.reply({ stickers: message.client.guilds.cache.get(message.guild.id).stickers.cache.filter(s => s.id === "1373482200602771486") });
    },
};