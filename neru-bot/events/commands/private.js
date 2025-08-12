const { ContainerBuilder, MessageFlags, TextDisplayBuilder, SectionBuilder, ButtonBuilder, ButtonStyle, ThreadAutoArchiveDuration, ChannelType, EmbedBuilder } = require('discord.js');
const { prefix, staffRoles, privateThreadChannelId } = require('../../config.json');

module.exports = {
    name: 'private',
    trigger: (message) => message.content.toLowerCase().startsWith(`${prefix}private`),
    async execute(message) {
        if (!message.member.roles.cache.some(role => staffRoles.includes(role.id))) return;
        if (!message.reference) return await message.delete();

        let targetIds = message.content
            .replace(`${prefix}private`, '')
            .replace(/<|>|@|,|-d(?:elete)?/g, '')
            .trim()
            .split(/\s+/)
            .filter(id => id.length > 0);

        const guild = message.client.guilds.cache.get(message.guild.id);
        let targetMembers = [];

        if (!guild || targetIds.length <= 0) targetIds = null;
        try {
            if (targetIds.length > 0) {
                for (const id of targetIds) {
                    targetMembers.push(await guild.members.fetch(id));
                }

            }
        } catch (err) {
            targetIds = null;
        }

        const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);

        await message.delete();

        const thread = await message.client.channels.cache.get(privateThreadChannelId).threads.create({
            name: `private-${targetMembers.map(member => member.user.username).join(', ') || referencedMessage.author.username}`,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
            type: ChannelType.PrivateThread,
            invitable: false,
            reason: 'Private thread to discuss moderation.'
        });

        if (!referencedMessage?.webhookId) await thread.members.add(referencedMessage.author.id);

        if (targetMembers.length > 0) {
            for (const id of targetMembers) {
                await thread.members.add(id.user.id);
            }
        }
        await thread.members.add(message.author.id);

        if (referencedMessage.attachments.size > 0) {
            for (const attachment of referencedMessage.attachments.values()) {
                await thread.send({ files: [attachment.url] });
            }
        }

        if (referencedMessage.embeds.length > 0) {
            for (const embed of referencedMessage.embeds) {
                await thread.send({ embeds: [embed] });
            }
        }

        if (referencedMessage.components.length > 0) {
            for (const component of referencedMessage.components) {
                await thread.send({ flags: MessageFlags.IsComponentsV2, components: [component], allowedMentions: { parse: [] } });
            }
        }

        await thread.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('#242429')
                    .setAuthor({ name: referencedMessage.author.username, iconURL: `https://cdn.discordapp.com/avatars/${referencedMessage.author.id}/${referencedMessage.author.avatar}.png` })
                    .setDescription(
                        (referencedMessage.content || '*Message contained attachment(s)*') +
                        (message.content.includes('-d')
                            ? '\n:wastebasket: Message was deleted by a moderator.'
                            : '')
                    )
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

        if (message.content.includes(`-d`)) await referencedMessage.delete();
    },
};
