module.exports = {
    name: 'baguette',
    trigger: (message) => message.content.toLowerCase().replaceAll(' leek', '').replaceAll(' job', '') == 'baguette',
    async execute(message) {
        await message.reply(':french_bread:');
    },
};