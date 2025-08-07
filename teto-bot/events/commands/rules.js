const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('discord.js');

module.exports = {
    name: 'rules',
    trigger: (message) => message.content.startsWith(`${process.env.PREFIX}rules`),
    async execute(message) {
        if (message.author.id !== '990500436047982602') return;
        
        await message.client.channels.cache.get(message.channel.id)?.send({
            flags: MessageFlags.IsComponentsV2,
            components: [
                new ContainerBuilder()
                    .addSeparatorComponents(new SeparatorBuilder().setSpacing(2))
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# Server Rules\n-# Last updated: <t:${Math.floor(Date.now() / 1000)}:D>.`)
                    )
                    .addSeparatorComponents(new SeparatorBuilder().setSpacing(2)),
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('` 1.` **Be Respectful to all Server Members**\n-# > Hate speech, Harassment, Racism, Doxxing, and any other type of disrespect targeted towards another person is not allowed.')
                    ),
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('` 2.` **NSFW and Gore is Prohibited**\n-# > Posting any content containing explicit imagery will result in an immediate ban. All content must be safe for a **13-year-old** to view, as that is the minimum age to be in this server.')
                    ),
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('` 3.` **No Controversial or Sensitive Topics**\n-# > Examples include: Politics, Religion, Historical World Events, Pedophilia, Grooming, Radicalization.\nDivisive topics are not allowed to be discussed in the server.')
                    ),
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('` 4.` **No Spamming / Flooding VCs**\n-# > Constant repetition, cluttering chat with unrelated media, or sending a large amount of messages at once is not allowed. This rule also applies to adding reactions.')
                    ),
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('` 5.` **Self-promotion is Disallowed**\n-# > Discord invite links to other servers are not allowed. Any other self-promotion (e.g Artwork, Youtube Video) may be done in *moderation* if it\'s on topic. DM Advertising will not be tolerated.')
                    ),
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('` 6.` **Post in the Appropriate Channels**\n-# > Please stay on-topic in the channel you are in. Encouraging a non-related disscusion topic will be resulted with a punishment.')
                    ),
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('` 7.` **English must be spoken in all Channels**\n-# > We don\'t have the ability to effectively moderate non-english messages, and we don\'t intend to in the future. You will be punished if you cannot use English.\n*(Google Translate exists if needed.)*')
                    ),
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('` 8.` **Use Common Sense / No Loopholes**\n-# > If you believe an action may break the rules, avoid doing it. Bending the rules in your favor will not be tolerated.\n*(Unfairly punished? Message an Admin.)*')
                    ),
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('` 9.` **No Mini-modding or Impersonation**\n-# > Enforcing server rules is to be done by Moderators. Respectfully referring a user to our rule list is allowed, however.\n:warning: Do not: **Threaten to punish users**, **Deliberately seek punishment against a user**, or **Argue against moderator judgment**.')
                    ),
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('` 10.` **Do not be a Nuisance**\n-# > While "annoying" isn\'t clearly defined, if multiple people in the channel are irritated with you, change your topic or behavior to avoid punishment.\nMedia that contains photosensitive visuals or ear-rape is not allowed.')
                    ),
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('` 11.` **Follow Discord Guidelines**\n-# > https://discord.com/terms, https://discord.com/guidelines.')
                    ),
            ]
        })

        await message.delete();
    },
};
