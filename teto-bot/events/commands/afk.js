const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const { setAfkUser } = require('../../utils/afkHelper');

module.exports = {
    name: 'afk',
    trigger: (message) => message.content.startsWith(`${prefix}afk`),
    async execute(message) {
        let afkReason = message.content.replace(`${prefix}afk`, '').trim() || "No reason specified.";

        setAfkUser(message.author.id, { username: message.member?.nickname || message.author.username, reason: afkReason, setAt: Date.now() })

        await message.reply({ flags: MessageFlags.IsComponentsV2, components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(afkReason)).addSeparatorComponents(new SeparatorBuilder()).addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Sending a message will automatically clear your AFK status.`))] });
        if (`[AFK] ${message.member.nickname || message.author.globalName}`.length < 32) await message.member.setNickname(`[AFK] ${message.member.nickname || message.author.globalName}`).catch(() => { });
    },
};
