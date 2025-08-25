module.exports = {
    name: 'leek',
    trigger: (message) => message.content.toLowerCase() == 'leek',
    async execute(message) {
        await message.reply('[leek](https://i.imgur.com/MbX5pzq.png)');
    },
};