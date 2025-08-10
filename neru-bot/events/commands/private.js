const { ContainerBuilder, MessageFlags, TextDisplayBuilder, SectionBuilder, ButtonBuilder, ButtonStyle, ThreadAutoArchiveDuration, ChannelType, EmbedBuilder } = require('discord.js');
const { prefix, staffRoles, guildId } = require('../../config.json');

module.exports = {
    name: 'private',
    trigger: (message) => message.content.toLowerCase().startsWith(`${prefix}private`),
    async execute(message) {
        if (!message.member.roles.cache.some(role => staffRoles.includes(role.id))) return;
        if (!message.reference) return await message.delete();

        let targetId = message.content.replace(`${prefix}private`, '').replace(/[<>@]/g, '').trim();

        const guild = message.client.guilds.cache.get(guildId);
        if (!guild || !targetId) targetId = null;
        try { const member = await guild.members.fetch(targetId); } catch (err) { targetId = null; }
        
        const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);

        await message.delete();

        const thread = await message.channel.threads.create({
            name: `private-${referencedMessage.author.username}`,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
            type: ChannelType.PrivateThread,
            invitable: false,
            reason: 'Private thread to discuss moderation.'
        });

        if (!referencedMessage?.webhookId) await thread.members.add(referencedMessage.author.id);
        console.log(targetId)
        if (targetId) await thread.members.add(targetId);
        await thread.members.add(message.author.id);

        if (referencedMessage.attachments.size > 0) {
            for (const attachment of referencedMessage.attachments.values()) {
                await thread.send({ files: [attachment.url] });
            }
        }

        await thread.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('#242429')
                    .setAuthor({ name: referencedMessage.author.username, iconURL: `https://cdn.discordapp.com/avatars/${referencedMessage.author.id}/${referencedMessage.author.avatar}.png` })
                    .setDescription(referencedMessage.content || '*Message contained attachment(s)*')
            ]
        });

        if (referencedMessage.embeds.length > 0) {
            for (const embed of referencedMessage.embeds) {
                await thread.send({ embeds: [embed] });
            }
        }

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
