require('discord.js');
const { prefix } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");
const { setCustomRoleEntry, deleteCustomRoleEntry } = require('../../utils/crHelper');

module.exports = {
    name: 'acrtu',
    trigger: (message) => message.content.toLowerCase().startsWith(`${prefix}acrtu`),
    async execute(message) {
        try {
            if (message.author.id !== "990500436047982602") return await replyWithText(message, ':x: Only `tdarth-chan` can use this command.');
            const args = message.content.replace(`${prefix}sendtochannel `, '').split(' ');

            if (args.length <= 1) return replyWithText(message, `:x: **Usage: ${prefix}acrtu roleid user remove/add**`);

            if (args[3] == 'remove') {
                deleteCustomRoleEntry(args[2]);
            } else {
                setCustomRoleEntry(args[2], { has_role: true, role_id: String(args[1]) });
            }

            await replyWithText(message, "Done");
        } catch (e) {
            console.log(`Acrtu command error: ${e}`);
            return replyWithText(message, `:x: **An error occurred.**\n-# \`${e}\``);
        }
    },
};
