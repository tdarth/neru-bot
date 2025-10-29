const { joinVoiceChannel } = require('@discordjs/voice');
const { prefix } = require('../../config.json');
const replyWithText = require('../../utils/replyWithText');

module.exports = {
    name: 'join',
    trigger: (message) => message.content.startsWith(`${prefix}join`),
    async execute(message) {
        if (message.author.id !== "990500436047982602") return await replyWithText(message, `:x: **No permission.**`);

        const connection = joinVoiceChannel({
            channelId: '1370793991108427807',
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false
        });

        if (connection) {
            replyWithText(message, "Joined")
        } else {
            replyWithText(message, `:x: **An error occurred.**`)
        }
    },
};
