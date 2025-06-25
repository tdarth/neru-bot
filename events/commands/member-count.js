const { prefix, emojis } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");

const aliases = ["member", "members", "membercount"]

module.exports = {
    name: 'members',
    trigger: (message) => aliases.some(alias => message.content.toLowerCase() == `${prefix}${alias}`),
    async execute(message) {
        replyWithText(message, `${emojis.neru} I'm currently watching **${message.guild.memberCount.toString()}** vocaloid fans!`);
    },
};