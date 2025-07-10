const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");

const afkStorageApiKey = process.env.AFK_API_KEY;

module.exports = {
    name: 'afk',
    trigger: (message) => message.content.startsWith(`${prefix}afk`),
    async execute(message) {
        let afkReason = message.content.replace(/(.*)afk/i, '').trim();
        if (afkReason == "") afkReason = "No reason specified.";

        try {
            const response = await fetch(`https://bakabakabakaafkusers.tdarthh.workers.dev/makeafk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userid: message.author.id,
                    username: message.member?.nickname || message.author.username,
                    reason: afkReason,
                    access_token: afkStorageApiKey
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("AFK API Error", {
                    status: response.status,
                    statusText: response.statusText,
                    responseHeaders: Object.fromEntries(response.headers.entries()),
                    errorText,
                    sentBody: {
                        userid: message.author.id,
                        username: message.member?.nickname || message.author.globalName,
                        reason: afkReason
                    }
                });
            
                return replyWithText(message, `:x: **An error occurred while setting your AFK status. #2**`);
            }

            await message.reply({ flags: MessageFlags.IsComponentsV2, components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(afkReason)).addSeparatorComponents(new SeparatorBuilder()).addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Sending a message will automatically clear your AFK status.`))] });
            if (`[AFK] ${message.member.nickname || message.author.globalName}`.length < 32) await message.member.setNickname(`[AFK] ${message.member.nickname || message.author.globalName}`).catch(() => {});
        } catch (error) {
            replyWithText(message, `:x: **An error occurred while setting your AFK status.**`);
            console.log(`${error} while setting AFK status`);
        }
    },
};
