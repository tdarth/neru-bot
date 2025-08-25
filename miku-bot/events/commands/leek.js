module.exports = {
    name: 'leek',
    trigger: (message) => message.content.toLowerCase() == 'leek' || message.content.toLowerCase().match(/^(?=.*\bjob\b)(?=.*\bbaguette\b)(?=.*\bleek\b)\b(job|baguette|leek)\b(?:\s+(job|baguette|leek)\b){2}$/),
    async execute(message) {
        await message.reply('[leek](https://i.imgur.com/MbX5pzq.png)');
    },
};