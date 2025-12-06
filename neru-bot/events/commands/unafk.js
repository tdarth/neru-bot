const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const { afkUsers, deleteAfkUser } = require('../../utils/afkHelper');

module.exports = {
    name: 'unafk',
    trigger: (message) => message.content.startsWith(`${prefix}unafk`),
    async execute(message) {
        if (!message.member.roles.cache.some(role => staffRoles.includes(role.id))) return;
        let id = message.content.replace(`${prefix}unafk`, '').replace('<', '').replace('>', '').replace('@', '').trim();
        const member = await message.guild.members.fetch(id);

        if (member && member.manageable) await member.setNickname(afkUsers[id].username, `User returned.`);
        
        deleteAfkUser(user);

        await message.reply({ flags: MessageFlags.IsComponentsV2, components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(':white_check_mark: **Removed.**'))] });
    },
};
