const { staffRoles, prefix } = require('../../config.json');
const replyWithText = require('../../utils/replyWithText');

module.exports = {
    name: 'close',
    trigger: (message) => message.content.startsWith(`${prefix}close`),
    async execute(message) {
        if (!message.channel.name.includes("private-")) return replyWithText(message, ":x: **This command can only be used in private threads.**");
        if (message.member.roles.cache.some(role => staffRoles.includes(role.id))) {
            const members = await message.channel.members.fetch();

            for (const [id] of members) {
                message.channel.members.remove(id);
            }

            await message.channel.setName(`[LOCKED] ${message.channel.name}`);
            await message.channel.setLocked(true);
        } else {
            replyWithText(message, ':x: **Only moderators can close private threads.**')
        }
    },
};