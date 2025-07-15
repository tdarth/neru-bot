const { Events, MessageFlags, ContainerBuilder, TextDisplayBuilder } = require('discord.js');
const replyWithText = require('../utils/replyWithText');
const { prefix } = require('../config.json');
const { afkUsers, deleteAfkUser } = require('../utils/afkHelper');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || message.content.startsWith(`${prefix}afk`)) return;

        const id = message.author.id;

        if (id in afkUsers) {
            await message.react('👋');

            if (message.member && message.member.manageable) {
                await message.member.setNickname(afkUsers[id].username, `User returned.`).catch(error => {
                    if (!error.toString().includes('Missing Permissions')) {
                        replyWithText(message, `:x: **Error while reverting your Nickname.**\n\`\`\`${error}\`\`\``);
                    }
                });
            }

            deleteAfkUser(id);
        }

        const mentionedIds = message.mentions.users.map(u => u.id);

        let repliedToId = null;
        if (message.reference?.messageId) {
            try {
                const refMsg = await message.channel.messages.fetch(message.reference.messageId);
                repliedToId = refMsg.author.id;
            } catch (err) {
                console.error('Fetch referenced message error:', err);
            }
        }

        if (mentionedIds.length === 0 && !repliedToId) return;

        const allUserIds = [...mentionedIds];
        if (repliedToId && !allUserIds.includes(repliedToId)) allUserIds.push(repliedToId);

        const afkUserIds = [];
        const afkUserReasons = [];

        for (const userId of allUserIds) {
            if (userId in afkUsers) {
                afkUserIds.push(userId);
                afkUserReasons.push(afkUsers[userId].reason);
            }
        }

        if (afkUserIds.length === 0) return;

        const afkMessage = afkUserIds.map((id, i) => `<@${id}> is **AFK**.\n${afkUserReasons[i]}`);

        const afkMessageReply = await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(afkMessage.join("\n\n"))
            )],
            allowedMentions: { repliedUser: true, parse: [] }
        });

        setTimeout(() => { afkMessageReply.delete().catch(() => {}); }, 5000);
    },
};
