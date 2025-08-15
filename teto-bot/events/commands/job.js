module.exports = {
    name: 'baguette',
    trigger: (message) => message.content.toLowerCase() == 'baguette',
    async execute(message) {
        await message.reply(':french_bread:');
    },
};