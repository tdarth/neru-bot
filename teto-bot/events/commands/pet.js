const { AttachmentBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const replyWithText = require('../../utils/replyWithText')

module.exports = {
    name: 'pet',
    trigger: (message) => message.content.startsWith(`${prefix}pet`),
    async execute(message) {
        const user = message.content.replace(`${prefix}pet`, '').trim() || message.author;
        if (!user) return await replyWithText(message, ':x: **An error occurred. Yikes!**');

        const res = await fetch(`https://api.some-random-api.com/premium/petpet?avatar=${user.avatarURL({extension: 'png'})}`);
        if (!res.ok) return await replyWithText(message, ':x: **An error occurred. Yikes!**');
        
        await message.reply({
            files: [new AttachmentBuilder(Buffer.from(await res.arrayBuffer()), {name: `petpet-${user.username || user.id || 'unknown'}.gif`})]
        })
    },
};
