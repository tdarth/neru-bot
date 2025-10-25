module.exports = {
    name: 'baguette',
    trigger: (message) => message.content.toLowerCase() == 'baguette' || message.content.toLowerCase().match(/^(?=.*\bjob\b)(?=.*\bbaguette\b)(?=.*\bleek\b)\b(job|baguette|leek)\b(?:\s+(job|baguette|leek)\b){2}$/),
    async execute(message) {
        if (message.channel.id == "1399976818605297825") return; // #counting
        await message.reply(':french_bread:');
    },
};