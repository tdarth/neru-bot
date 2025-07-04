const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");

const afkStorageApiKey = process.env.AFK_API_KEY;

module.exports = {
    name: 'afk',
    trigger: (message) => message.content.startsWith(`${prefix}afk`),
    async execute(message) {
        let afkReason = message.content.replace(/(.*)afk/i, '').trim();
        if (afkReason == "") afkReason = "No reason specified."

        fetch(`https://bakabakabakaafkusers.tdarthh.workers.dev/makeafk`, {
            method: "POST",
            body: JSON.stringify({
                "userid": message.author.id,
                "username": message.member?.nickname || message.author.globalName,
                "reason": afkReason,
                "access_token": afkStorageApiKey
            })
        })
            .then(response => {
                if (!response.ok) {
                  console.log(`AFK Error: ${JSON.stringify(response)}`);
                  return replyWithText(message, `:x: **An error occurred while setting your AFK status. #2**`);
                }
                message.reply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(afkReason)).addSeparatorComponents(new SeparatorBuilder()).addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Sending a message will automatically clear your AFK status.`))]
                });

                if (`[AFK] ${message.member.nickname || message.author.globalName}`.length >= 32) return;
                message.member.setNickname(`[AFK] ${message.member.nickname || message.author.globalName}`).catch(error => { });
            })
            .catch(error => {
                replyWithText(message, `:x: **An error occurred while setting your AFK status.**`);
                console.log(`${error} while setting AFK status`);
            })
    },
};
