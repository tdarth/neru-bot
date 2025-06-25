const { TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const { prefix, emojis } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");

module.exports = {
    name: 'sendmessage',
    trigger: (message) => message.content.toLowerCase().startsWith(`${prefix}sendmessage`),
    async execute(message) {
        if (message.author.id !== "990500436047982602") return await replyWithText(message, ':x: Only `tdarth-chan` can use this command.');

        const container = new ContainerBuilder();

        const arg = message.content.replace(`${prefix}sendmessage `, ``);
        switch (arg) {
            case "rules":
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${emojis.neru}${emojis.miku}${emojis.teto}\n# Server Rules\n:scroll: __Last updated:__ <t:${Math.floor(Date.now() / 1000)}:D>.`));
                container.addSeparatorComponents(new SeparatorBuilder());
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent('`1.` Be respectful to all server members.\n-# Hate speech, Harassment, Racism, Doxxing, and any other type of disrespect targeted towards another person is __strictly forbidden__.\n\n`2.` Keep spamming to a minimum.\n-# Repeatedly sending text, images, embeds, etc. will result in a **mute**.\n\n`3.` Self-Promotion/Advertising is currently disallowed.\n-# Sending links to other Discord Servers or advertising media is not allowed.\n\n`4.` Political/Religious Topics are prohibited.\n-# This is a vocaloid server. Please keep these topics elsewhere.\n\n`5.` We are a SFW (safe-for-work) server.\n-# Posting any NSFW content will result in an **immediate ban**.\n\n`6.` No racist, insulting or otherwise derogatory commentary.\n-# This type of content is not allowed anywhere in this server.\n\n`7.` Discord Guidelines must be followed at all times.\n-# They can be found here: https://discord.com/guidelines.\n\n`8.` Keep relevant topics where they belong.\n-# e.g. Polls should be used in <#1369771049402634411> and bot commands in <#1369383513132105874>.\n\n`9.` Our server is currently English-only.\n-# The occasional message in a foreign language is allowed, but repeatedly sending non-english messages it will result in a **mute**.\n\n`10.` "Minimodding" is not allowed.\n-# Enforcing server rules is a job for moderators. If you believe a user has broken these rules, follow the reporting guide below.\n\n`11.` All rules are subject to common sense.\n-# Punishments are up to staff discretion. Don\'t try to bypass rules.\n\nBreaking any of the following rules will be resulted with a punishment depending on the severity of the action.\n-# ' + emojis.neru_fire + ' Neru will also break into your house! (how scary!)\n\nIf you believe to have found a member breaking our rules, type `!report <user> <reason>` in the current channel.\n-# Abusing this command will lead to punishment.'));

                await message.client.channels.cache.get(message.channel.id)?.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container]
                })
                break;
            case "tags":
                await replyWithText(message, `Tags`);
                break;
            default:
                await replyWithText(message, `:x: Invalid argument passed.`);
        }
        await message.delete();
    },
};