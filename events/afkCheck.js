const { Events, MessageFlags, ContainerBuilder, TextDisplayBuilder } = require('discord.js');
const replyWithText = require('../utils/replyWithText');

const afkStorageApiKey = process.env.AFK_API_KEY

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        try {
            const response = await fetch(`https://bakabakabakaafkusers.tdarthh.workers.dev/isafk?userid=${message.author.id}&access_token=${afkStorageApiKey}`);
            if (!response.ok) throw new Error("AFK check failed");

            const data = await response.json();

            if (data[0].afk) {
                const unafkResponse = await fetch(`https://bakabakabakaafkusers.tdarthh.workers.dev/unafk`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userid: message.author.id, access_token: afkStorageApiKey })
                });

                if (!unafkResponse.ok) {
                    replyWithText(message, `:x: **An error occurred while unsetting your AFK status.**`);
                } else {
                    await message.react(`👋`);
                    await message.member.setNickname(data[0].username, `User returned.`).catch(error => {
                        if (!error.toString().includes(`Missing Permissions`)) {
                            replyWithText(message, `:x: **Error while reverting your Nickname.**\n\`\`\`${error}\`\`\``)
                        }
                    });
                }
            }
        } catch (error) {
            console.error(`${error} while checking/unsetting AFK status`);
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

        fetch(`https://bakabakabakaafkusers.tdarthh.workers.dev/isafk?userid=${allUserIds.join(',')}&access_token=${afkStorageApiKey}`, {})
            .then(response => response.json())
            .then(async (data) => {
                let afkUserIds = [];
                let afkUserReasons = [];
                data.forEach(user => {
                    if (user.afk) {
                        afkUserIds.push(user.userid);
                        afkUserReasons.push(user.reason);
                    }
                });

                const afkMessage = afkUserIds.map((id, i) => `<@${id}> is **AFK**\n${afkUserReasons[i]}`);

                const afkMessageReply = await message.reply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(afkMessage.join("\n\n")))],
                    allowedMentions: {
                        parse: []
                    }
                });

                setTimeout(() => { afkMessageReply.delete(); }, 5000);
            })
            .catch(error => {
                console.error(`${error} while fetching AFK userids.`);
            })
    },
};
