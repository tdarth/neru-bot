module.exports = {
    name: 'job',
    trigger: (message) => message.content.toLowerCase() == 'job' || message.content.toLowerCase().match(/^(?=.*\bjob\b)(?=.*\bbaguette\b)(?=.*\bleek\b)\b(job|baguette|leek)\b(?:\s+(job|baguette|leek)\b){2}$/),
    async execute(message) {
        await message.reply({ stickers: message.client.guilds.cache.get(message.guild.id).stickers.cache.filter(s => s.id === "1373482200602771486") });
    },
};