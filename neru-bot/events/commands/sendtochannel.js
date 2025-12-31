const { TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const { prefix } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");

module.exports = {
    name: 'sendtochannel',
    trigger: (message) => message.content.toLowerCase().startsWith(`${prefix}sendtochannel`),
    async execute(message) {
        try {
            if (message.author.id !== "990500436047982602") return await replyWithText(message, ':x: Only `tdarth-chan` can use this command.');
            const args = message.content.replace(`${prefix}sendtochannel `, '').split(' ');

            if (args.length <= 1) return replyWithText(message, `:x: **Usage: ${prefix}sendtochannel channel message**`);

            const channelIdToSend = args[0].replace(/[<>#]/g, '') || null;
            if (!channelIdToSend || isNaN(channelIdToSend)) return replyWithText(message, `:x: **Invalid channel.**`);

            const channelToSend = await message.client.channels.fetch(channelIdToSend);
            await channelToSend.send(args.slice(1).join(' '));
        } catch (e) {
            console.log(`Send to channel command error: ${e}`);
            return replyWithText(message, `:x: An error occurred.`);
        }
    },
};
