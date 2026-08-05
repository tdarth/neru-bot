module.exports = {
    name: 'hambuhbuh',
    trigger: (message) => message.content.toLowerCase() == 'hambuhbuh',
    async execute(message) {
        if (message?.guild?.id != "1369247242724179998") return; // baka^3
        await message.reply('https://tdarth.pages.dev/assets/hambuhbuh.gif');
    },
};