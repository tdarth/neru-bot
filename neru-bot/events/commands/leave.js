const { getVoiceConnections } = require('@discordjs/voice');
const { prefix } = require('../../config.json');
const replyWithText = require('../../utils/replyWithText');

module.exports = {
    name: 'join',
    trigger: (message) => message.content.startsWith(`${prefix}join`),
    async execute(message) {
        if (message.author.id !== "990500436047982602") return await replyWithText(message, `:x: **No permission.**`);

        const connections = getVoiceConnections();

        if (connections.size === 0) {
            return replyWithText(message, "Not connected")
        }

        connections.forEach(connection => {
            connection.destroy();
        });

        replyWithText(message, 'Left voice channels');
    },
};
