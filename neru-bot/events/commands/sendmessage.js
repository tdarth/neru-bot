const { TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, MessageFlags, ActionRowBuilder, SectionBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { prefix, emojis } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");

const boostMenuOptions = [
    { label: 'Create', value: 'boostMenu_manage', emoji: '✏️', description: 'Create your custom role.' },
    { label: 'Delete', value: 'boostMenu_delete', emoji: '❌', description: 'Deletes your custom role, allowing you to make a new one.' },
];

module.exports = {
    name: 'sendmessage',
    trigger: (message) => message.content.toLowerCase().startsWith(`${prefix}sendmessage`),
    async execute(message) {
        if (message.author.id !== "990500436047982602") return await replyWithText(message, ':x: Only `tdarth-chan` can use this command.');

        const container = new ContainerBuilder();

        const arg = message.content.replace(`${prefix}sendmessage `, ``);
        switch (arg) {
            case "boostmenu":
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## :sparkles: Custom Role\nThank you for Boosting the server! <:01_neru_heart:1430394945327333438>\nYou may create a custom role in the server using the dropdown below.\n> **NOTE:** Your custom role will be removed if you choose to stop boosting.`)
                )

                container.addActionRowComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('boostMenu')
                                .setPlaceholder('Choose an option...')
                                .addOptions(boostMenuOptions)
                        )
                )

                await message.client.channels.cache.get(message.channel.id)?.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container]
                })

                break;
            case "staffapp":
                container.addSectionComponents(
                    new SectionBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`## :pencil: Staff Application\nClicking **Create** will open a form within Discord for you to preview and complete. It won't be visible to anyone until you submit the application.\n-# > **NOTE:** Your progress will be saved, assuming you don't close Discord. Please respect the 2 week application cooldown.`)
                    ).setButtonAccessory(
                        new ButtonBuilder()
                            .setCustomId('staffApp_button')
                            .setStyle(ButtonStyle.Primary)
                            .setLabel("Create")
                    )
                );

                await message.client.channels.cache.get(message.channel.id)?.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container]
                })

                break;

            case "honeypotmsg":
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :warning: Don't send messages here.\nThis channel is used for automatically banning scam bots.\n-# > You will receive a 1 second ban if you send a message here.`));

                await message.client.channels.cache.get(message.channel.id)?.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container]
                })
                break;
            case "rules":
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${emojis.neru}${emojis.miku}${emojis.teto}\n# Server Rules\n:scroll: __Last updated:__ <t:${Math.floor(Date.now() / 1000)}:D>.`));
                container.addSeparatorComponents(new SeparatorBuilder());
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent('`1.` Be respectful to all server members.\n-# Hate speech, Harassment, Racism, Doxxing, and any other type of disrespect targeted towards another person is __strictly forbidden__.\n\n`2.` Keep spamming to a minimum.\n-# Repeatedly sending text, images, embeds, reactions, etc. will result in a **mute**.\n\n`3.` Self-Promotion/Advertising is currently disallowed.\n-# Sending links to other Discord Servers or advertising media is not allowed.\n\n`4.` Political/Religious Topics are prohibited.\n-# Please keep these opinions elsewhere. If your message may shift the channel\'s topic, don\'t send it.\n\n`5.` We are a SFW (safe-for-work) server.\n-# Posting any explicit NSFW content will result in an **immediate ban**.\n\n`6.` No racist, insulting, or otherwise derogatory commentary.\n-# This type of content is not allowed anywhere in this server.\n\n`7.` Discord Guidelines must be followed at all times.\n-# They can be found here: https://discord.com/guidelines.\n\n`8.` Keep relevant topics where they belong.\n-# e.g. Polls should be used in <#1369771049402634411>, bot commands in <#1369383513132105874>, etc.\n\n`9.` Our server is currently English-only.\n-# The occasional message in a another language is allowed, but repeatedly sending non-english messages will result in a **mute** and possible **ban**. This includes content within media.\n\n`10.` "Minimodding" is discouraged.\n-# Enforcing server rules is a job for moderators. If you believe a user has broken these rules, follow the reporting guide below. Respectfully referring another member to this rule list is allowed, however.\n\n`11.` All rules are subject to common sense.\n-# Enforcement is up to staff discretion. If you believe your infraction was unjustified, please open a ticket.\n\n`12.` Be wary when posting media.\n-# Content containing "ear-rape" or photosensitive visuals is not allowed. Do not share screenshots or copies of rulebreaking messages, even if they are spoilered.\n\n`13.` Do not be a nuisance.\n-# While "annoying" isn\'t clearly defined, if a majority of the members are unhappy with a specific user (or multiple users) conduct, we will ask you to either move channels, or to stop the conduct altogether. Further instances of such after being told to stop will be subject to moderative action. Please do not "ragebait".\n\n`14.` Do not post paid content, such as Music, Movies, or Games, unless you are the artist or producer of said music or game / movie content.\n-# Sharing the *full* files without owning the rights to them is known as a form of Piracy called P2P Filesharing, and will not be tolerated here. For example, to post a song, please link to the official Youtube/Spotify page instead of posting an entire .mp3 file.\n\n\`15.\` Unwanted Discussion Topics must be taken to <#1369789274827784232>.\n-# This includes repeated talking points differing from Vocaloid, if showed disinterest from a majority of members in the channel. Please keep "brainrot" use sparingly. Unsure if your post is appropriate for the server? Take your discussion to DMs.\n\nBreaking any of the following rules will be resulted with a punishment depending on the severity of the action. Past infraction counts are also taken into consideration.\n-# ' + emojis.neru_fire + ' Neru will also break into your house! (how scary!)\n\nPunishments will be given to __both users__ if one user\'s rulebreaking is met with another user also breaking the rules, subject to moderator discretion. If you encounter a rulebreaker, please disengage and report the situation, found below:\n> If you believe to have found a member breaking our rules, reply with `!report <reason>` to one of the rulebreaking messages.\n-# Abusing this command will lead to punishment. Troll reports will not be considered.\n\n:warning: Punishment evasion may escalate into a permanent ban.'));

                await message.client.channels.cache.get(message.channel.id)?.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container]
                })
                break;
            case "tags":
                await message.client.channels.cache.get(message.channel.id)?.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(
                                        `${emojis.neru}${emojis.miku}${emojis.teto}\n## The List of Tags!\n-# Servers marked with \`⭐\` are owned by <@990500436047982602>. Please keep in mind I have no control over external servers and simply add one if it contains a vocaloid-relating tag.\n\n:scroll: __Last updated:__ <t:${Math.floor(Date.now() / 1000)}:D>\n### Vocaloids\n- ${emojis.blue_heart} \`MIKU\` - https://discord.gg/UpEghygsaa\n- ${emojis.yellow_heart} \`RIN\` - https://discord.gg/8YpYWNK5Qp\n- ${emojis.yellow_heart} \`LEN\` - https://discord.gg/uFzMDp4XGC\n- ${emojis.red_moon} \`メイコ\` - https://discord.gg/jTSSnc9mUt :star:\n- ${emojis.blurple_heart} \`カイト\` - https://discord.gg/MkcqAYfvFu\n- ${emojis.pink_heart} \`LUKA\` - https://discord.gg/r29FMbBHxz\n- ${emojis.green_leaf} \`GUMI\` - https://discord.gg/bnBmbtB9F2 :star:\n- ${emojis.red_mushroom} \`KAAI\` - https://discord.gg/cDbsg8GZ3F :star:\n- ${emojis.purple_moon} \`フラワ\` - https://discord.gg/D4vV6MXUMR :star:\n- ${emojis.orange_star} \`SeeU\` - https://discord.gg/UAb647j6Av :star:\n- ${emojis.blurple_heart} \`UNA\` - https://discord.gg/uQz57Ke\n- ${emojis.purple_heart} \`HIME\` - https://discord.gg/9ewR3M9RQf\n### UTAU/Fanloids\n- ${emojis.red_heart} \`TETO\` - https://discord.gg/FRZa2u59YG :star:\n- ${emojis.yellow_heart} \`NERU\` - https://discord.gg/hxVAASyP9e :star:\n- ${emojis.purple_heart} \`UTA\` - https://discord.gg/cYP4BcwpRZ :star:\n- ${emojis.purple_heart} \`HAKU\` - https://discord.gg/hD93NYe7NX\n- ${emojis.orange_heart} \`REI\` - https://discord.gg/d9bf6rSqKc\n### PJSK\n- ${emojis.ln} ${emojis.blue_gray_star} \`L/n\` - https://discord.gg/K3qAUbZBcb :star:\n- ${emojis.mmj} ${emojis.green_leaf} \`MMJ\` - https://discord.gg/fNsDdSDXRH :star:\n- ${emojis.vbs} ${emojis.pink_moon} \`ⅥVID\` - https://discord.gg/FQ5gFaM3zx :star:\n- ${emojis.wxs} ${emojis.orange_purple_star} \`WxS\` - https://discord.gg/darfm6XNK5 :star:\n- ${emojis.n25} ${emojis.purple_heart} \`N25\` - https://discord.gg/ee2sAJEYCT\n- ${emojis.blue_crest} \`一歌\` - https://discord.gg/VP5uPGF2fD\n- ${emojis.light_pink_heart} \`airi\` - https://discord.gg/kCSSzerX4Q\n- ${emojis.light_purple_heart} \`まふゆ\` - https://discord.gg/dMG5caGbWW\n### Miscellaneous\n- ${emojis.purple_heart} \`UTAU\` - https://discord.gg/BheHRPdpzA :star:\n- ${emojis.gray_moon} \`DECO\` - https://discord.gg/KY9EQPEmBf :star:\n- ${emojis.gray_shard} ${emojis.gray_moon} \`稲葉曇\` - https://discord.gg/inabakumori\n- - https://discord.gg/DCw3a6F52A\n- ${emojis.cyan_fire} \`32ki\` - https://discord.gg/qtUjxjH3Eq\n- ${emojis.red_skull} \`MRTU\` - https://discord.gg/4JCFBPU2by\n- ${emojis.blue_gray_star} \`KRKI\` - https://discord.gg/DGZjkYBRyH\n- ${emojis.orange_heart} \`ERB\` - https://discord.gg/FXZqGaPGuZ\n\nHave another tag to add or expired link? Message <@990500436047982602>. ${emojis.neru_hmm}`)
                            )
                    ],
                    allowedMentions: { parse: [] }
                })
                break;
            default:
                await replyWithText(message, `:x: Invalid argument passed.`);
        }
        await message.delete();
    },
};
