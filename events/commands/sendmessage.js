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
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent('`1.` Be respectful to all server members.\n-# Hate speech, Harassment, Racism, Doxxing, and any other type of disrespect targeted towards another person is __strictly forbidden__.\n\n`2.` Keep spamming to a minimum.\n-# Repeatedly sending text, images, embeds, reactions, etc. will result in a **mute**.\n\n`3.` Self-Promotion/Advertising is currently disallowed.\n-# Sending links to other Discord Servers or advertising media is not allowed.\n\n`4.` Political/Religious Topics are prohibited.\n-# Please keep these opinions elsewhere. If your message may shift the channel\'s topic, don\'t send it.\n\n`5.` We are a SFW (safe-for-work) server.\n-# Posting any explicit NSFW content will result in an **immediate ban**.\n\n`6.` No racist, insulting, or otherwise derogatory commentary.\n-# This type of content is not allowed anywhere in this server.\n\n`7.` Discord Guidelines must be followed at all times.\n-# They can be found here: https://discord.com/guidelines.\n\n`8.` Keep relevant topics where they belong.\n-# e.g. Polls should be used in <#1369771049402634411>, bot commands in <#1369383513132105874>, etc.\n\n`9.` Our server is currently English-only.\n-# The occasional message in a another language is allowed, but repeatedly sending non-english messages it will result in a **mute** and possible **ban**. This includes content within media.\n\n`10.` "Minimodding" is discouraged.\n-# Enforcing server rules is a job for moderators. If you believe a user has broken these rules, follow the reporting guide below.\n\n`11.` All rules are subject to common sense.\n-# Punishments are up to staff discretion. If you believe your infraction was unjustified, please open a ticket.\n\n`12.` Be wary when posting media.\n-# Content containing "ear-rape" or photosensitive visuals is not allowed.\n\n`13.` Do not be a nuisance.\n-# While "annoying" isn\'t clearly defined, if multiple people in the channel are irritated with you, change your topic or behavior to avoid punishment.\n\n`14.` Do not post paid content, such as Music, Movies, or Games, unless you are the artist or producer of said music or game / movie content.\n-# Sharing the *full* files without owning the rights to them is known as a form of Piracy called P2P Filesharing, and will not be tolerated here. For example, to post a song, please link to the official Youtube/Spotify page instead of posting an entire .mp3 file.\n\nBreaking any of the following rules will be resulted with a punishment depending on the severity of the action. Past infraction counts are also taken into consideration.\n-# ' + emojis.neru_fire + ' Neru will also break into your house! (how scary!)\n\nIf you believe to have found a member breaking our rules, reply with `!report <reason>` to one of the rulebreaking messages.\n-# Abusing this command will lead to punishment. Troll reports will not be considered.'));

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
