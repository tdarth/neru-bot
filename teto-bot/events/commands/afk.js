const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const { setAfkUser } = require('../../utils/afkHelper');
const replyWithText = require('../../utils/replyWithText')

const aliases = ["afk", "awayfromkeyboard"];

module.exports = {
    name: 'afk',
    trigger: (message) => aliases.some(alias => message.content.toLowerCase().startsWith(`${prefix}${alias}`)),
    async execute(message) {
        if (message.guild.id == "1369181065385869352") return await replyWithText(message, ":x: **This command has been disabled.**");
        const usedAlias = aliases.find(a => message.content.startsWith(`${prefix}${a}`));

        let afkReason = message.content
            .slice((`${prefix}${usedAlias}`).length)
            .trim() || 'No reason specified.';

        setAfkUser(message.author.id, { username: message.member?.nickname || message.author.username, reason: afkReason, setAt: Date.now() })

        await message.reply({ flags: MessageFlags.IsComponentsV2, components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(afkReason)).addSeparatorComponents(new SeparatorBuilder()).addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Sending a message will automatically clear your AFK status.`))] });
        if (`[AFK] ${message.member.nickname || message.author.globalName}`.length < 32) await message.member.setNickname(`[AFK] ${message.member.nickname || message.author.globalName}`).catch(() => { });
    },
};
