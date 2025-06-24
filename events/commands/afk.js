const { Events, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.content.toLowerCase().startsWith(`${prefix}afk`)) return;
        let afkReason = message.content.replace(/(.*)afk/i, '').trim();
        if (afkReason == "") afkReason = "No reason specified."

        fetch(`https://bakabakabakaafkusers.tdarthh.workers.dev/makeafk`, {
            method: "POST",
            body: JSON.stringify({
                "userid": message.author.id,
                "username": message.member?.nickname || message.author.globalName,
                "reason": afkReason,
                "access_token": process.env.AFK_API_KEY
            })
        })
        .then(response => {
            if (!response.ok) return replyWithText(message, `:x: **An error occurred while setting your AFK status.**`);
            message.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(afkReason)).addSeparatorComponents(new SeparatorBuilder()).addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Sending a message will automatically clear your AFK status.`))]
            });

            if (`[AFK] ${message.member.nickname || message.author.globalName}`.length >= 32) return;
            message.member.setNickname(`[AFK] ${message.member.nickname || message.author.globalName}`).catch(error => {});
        })
        .catch(error => {
            replyWithText(message, `:x: **An error occurred while setting your AFK status.**`);
            console.log(`${error} while setting AFK status`);
        })
    },
};