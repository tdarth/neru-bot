module.exports = {
    name: 'baguette',
    trigger: (message) => message.content.toLowerCase() == 'baguette' || message.content.toLowerCase().match(/^(?=.*\bjob\b)(?=.*\bbaguette\b)(?=.*\bleek\b)\b(job|baguette|leek)\b(?:\s+(job|baguette|leek)\b){2}$/),
    async execute(message) {
        await message.reply('https://i.imgur.com/S1PQ7tt.png');
    },
};