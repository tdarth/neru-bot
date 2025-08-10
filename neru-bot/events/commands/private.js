const { ContainerBuilder, MessageFlags, TextDisplayBuilder, SectionBuilder, ButtonBuilder, ButtonStyle, ThreadAutoArchiveDuration, ChannelType, EmbedBuilder } = require('discord.js');
const { prefix, staffRoles } = require('../../config.json');

module.exports = {
    name: 'private',
    trigger: (message) => message.content.toLowerCase().startsWith(`${prefix}private`),
    async execute(message) {
        if (!message.member.roles.cache.some(role => staffRoles.includes(role.id))) return;
        if (!message.reference) return await message.delete();
        const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);

        await message.delete();

        const thread = await message.channel.threads.create({
            name: `private-${referencedMessage.author.username}`,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
            type: ChannelType.PrivateThread,
            invitable: false,
            reason: 'Private thread to discuss moderation.'
        });

        await thread.members.add(referencedMessage.author.id);
        await thread.members.add(message.author.id);

        await thread.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('#242429')
                    .setAuthor({ name: referencedMessage.author.username, iconURL: `https://cdn.discordapp.com/avatars/${referencedMessage.author.id}/${referencedMessage.author.avatar}.png` })
                    .setDescription(referencedMessage.content || '*Message contained an attachment*')
            ]
        });

        await thread.send({
            flags: MessageFlags.IsComponentsV2,
            components: [
                new ContainerBuilder()
                    .addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`Private channel opened by <@${message.author.id}>.`)
                            )
                            .setButtonAccessory(
                                new ButtonBuilder()
                                    .setLabel('Close')
                                    .setCustomId('private_button')
                                    .setStyle(ButtonStyle.Danger)
                            )
                    )
            ],
            allowedMentions: { parse: [] }
        });
    },
};
