const { ContainerBuilder, MessageFlags, TextDisplayBuilder, ThumbnailBuilder, SectionBuilder, ButtonBuilder, ButtonStyle, SeparatorBuilder } = require('discord.js');
const { prefix, reportPingRoles, reportsChannelId } = require('../../config.json');
const replyWithText = require('../../utils/replyWithText');

module.exports = {
    name: 'report',
    trigger: (message) => message.content.toLowerCase().startsWith(`${prefix}report`) || message.content.toLowerCase().startsWith('!report'),
    async execute(message) {
        if (!message.reference) return await replyWithText(message, `:x: **Please reply this command to the message you are reporting.**`);
        const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
        const authorId = referencedMessage.author.id;

        const messages = await message.channel.messages.fetch({ limit: 100 });

        const userMessages = messages
            .filter(msg => msg.author.id === authorId)
            .first(8)
            .reverse();

        let reportReason = message.content.toLowerCase().replace(/^(\?report|!report)/, '').trim();
        if (reportReason == "") reportReason = "No reason specified."

        const container = new ContainerBuilder();

        container.addSectionComponents(new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`${reportPingRoles.map(id => `<@&${id}>`).join(' ')}\n## Report against <@${authorId}> \`${authorId}\`\n* __Submitted By__: <@${message.author.id}>. \`${message.author.id}\`\n* __In Channel__: <#${message.channel.id}>.\n* __Timestamp__: <t:${Math.floor(Date.now() / 1000)}:f>.\n\n:notepad_spiral: **Reason:** \`${reportReason}\`\n:pencil2: **Attached Message**: \`\`\`${referencedMessage.content}\`\`\`\n-# Below are recent messages sent by the reported user.`)).setThumbnailAccessory(new ThumbnailBuilder().setURL(`https://cdn.discordapp.com/avatars/${authorId}/${referencedMessage.author.avatar}.png`))).addSeparatorComponents(new SeparatorBuilder());

        for (const userMessage of userMessages) {
            container.addSectionComponents(new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`${userMessage.content}\n`)).setButtonAccessory(new ButtonBuilder().setLabel(`Jump`).setURL(`https://discord.com/channels/${userMessage.guildId}/${userMessage.channelId}/${userMessage.id}`).setStyle(ButtonStyle.Link))).addSeparatorComponents(new SeparatorBuilder());
        }

        container.addSectionComponents(new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("Finished with the report?")).setButtonAccessory(new ButtonBuilder().setLabel("Mark as Resolved").setStyle(ButtonStyle.Success).setCustomId(`markAsResolved_button`)));

        await message.client.channels.cache.get(reportsChannelId)?.send({
            flags: MessageFlags.IsComponentsV2, components: [container], allowedMentions: {
                parse: ['roles'],
                users: [],
                repliedUser: false
            }
        });
        await message.delete();
    },
};