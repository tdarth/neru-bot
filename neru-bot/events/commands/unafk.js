const { MessageFlags, ContainerBuilder, TextDisplayBuilder } = require('discord.js');
const replyWithText = require('../../utils/replyWithText');
const { prefix, staffRoles } = require('../../config.json');
const { afkUsers, deleteAfkUser } = require('../../utils/afkHelper');

module.exports = {
    name: 'unafk',
    trigger: (message) => message.content.startsWith(`${prefix}unafk`),
    async execute(message) {
        if (!message.member.roles.cache.some(role => staffRoles.includes(role.id))) return await message.reply('<:neru_hmm:1440604542638096384>');
        const id = message.content.replace(`${prefix}unafk`, '').replace('<', '').replace('>', '').replace('@', '').trim();
        if (!id) return replyWithText(message, ':x: **Usage: ?unafk <user/userid>**');
        const member = await message.guild.members.fetch(id);

        if (member && member.manageable) await member.setNickname(afkUsers[id].username, `User returned.`);
        
        deleteAfkUser(id);

        await message.reply({ flags: MessageFlags.IsComponentsV2, components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(':white_check_mark: **Removed.**'))] });
    },
};
