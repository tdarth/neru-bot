const { Events, MessageFlags, PermissionsBitField, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('discord.js');
const { deletedLinksChannelId } = require('../config.json');

const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+/i;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!urlRegex.test(message.content)) return;
        if (
            message.channel.id === '1370819406308835359' ||
            message.channel.id === '1370819438139674634'
        ) return;

        if (message.member.permissions.has(PermissionsBitField.Flags.EmbedLinks)) return;

        const level15Message = await message.reply({ flags: MessageFlags.IsComponentsV2, components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(":x: **Level 15** is required to send gifs/links.")).addSeparatorComponents(new SeparatorBuilder()).addTextDisplayComponents(new TextDisplayBuilder().setContent("-# You can check your progress with **level** in <#1369383513132105874>."))] })
        await message.delete();

        const sentDeletedMessage = await message.client.channels.cache
            .get(deletedLinksChannelId)
            .send({ content: message.content, allowedMentions: { parse: [] } });

        await sentDeletedMessage.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `Sent by \`${message.author.id}\` in <#${message.channel.id}>. <@${message.author.id}>`
                    )
                )
            ],
            allowedMentions: { parse: [] }
        });

        setTimeout(() => { level15Message.delete(); }, 3000);
    },
};
