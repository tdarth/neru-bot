const { prefix, emojis } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");

const aliases = ["member", "members", "membercount"]

module.exports = {
    name: 'members',
    trigger: (message) => aliases.some(alias => message.content.toLowerCase() == `${prefix}${alias}`),
    async execute(message) {
        const response = await fetch('https://discord.com/api/v9/invites/hxVAASyP9e?with_counts=true');
        if (!response.ok) return replyWithText(message, `:x: **An error occurred.**`);

        const data = await response.json();

        replyWithText(message, `${emojis.neru} I'm currently watching **${data.approximate_presence_count}**/**${data.approximate_member_count}** vocaloid fans!`);
    },
};