const { Events } = require('discord.js');
const { prefix, emojis } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");

const aliases = ["member", "members", "membercount"]

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !aliases.some(alias => message.content.toLowerCase() == `${prefix}${alias}`)) return;
        replyWithText(message, `${emojis.neru} I'm currently watching **${message.guild.memberCount.toString()}** vocaloid fans!`);
    },
};