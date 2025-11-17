module.exports = {
    name: 'cool',
    trigger: (message) => message.content.toLowerCase() == 'tdarth',
    async execute(message) {
        await message.reply('is so cool');
    },
};