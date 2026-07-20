require('discord.js');
const { prefix } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");
const { setCustomRoleEntry } = require('../../utils/crHelper');

module.exports = {
    name: 'acrtu',
    trigger: (message) => message.content.toLowerCase().startsWith(`${prefix}acrtu`),
    async execute(message) {
        try {
            if (message.author.id !== "990500436047982602") return await replyWithText(message, ':x: Only `tdarth-chan` can use this command.');
            const args = message.content.replace(`${prefix}sendtochannel `, '').split(' ');

            if (args.length <= 2) return replyWithText(message, `:x: **Usage: ${prefix}acrtu roleid user**`);

            setCustomRoleEntry(args[0], { has_role: true, role_id: String(args[1]) });
            await replyWithText(message, "Done");
        } catch (e) {
            console.log(`Acrtu command error: ${e}`);
            return replyWithText(message, `:x: **An error occurred.**\n-# \`${e}\``);
        }
    },
};
