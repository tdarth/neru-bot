const { getVoiceConnections } = require('@discordjs/voice');
const { staffRoles, prefix } = require('../../config.json');
const replyWithText = require('../../utils/replyWithText');

module.exports = {
    name: 'leave',
    trigger: (message) => message.content.startsWith(`${prefix}leave`),
    async execute(message) {
        if (message.member.roles.cache.some(role => staffRoles.includes(role.id))) {
            const connections = getVoiceConnections();

            if (connections.size === 0) {
                return replyWithText(message, "Not connected")
            }

            connections.forEach(connection => {
                connection.destroy();
            });

            replyWithText(message, 'Left voice channels');
        } else {
            return await replyWithText(message, `:x: **No permission.**`);
        }
    },
};
