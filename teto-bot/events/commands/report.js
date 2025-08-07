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

        let reportReason = message.content.toLowerCase().replace(/^(\?report|!report|.report)/, '').trim();
        if (reportReason == "") reportReason = "No reason specified."

        const container = new ContainerBuilder();

        container.addSectionComponents(new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`${reportPingRoles.map(id => `<@&${id}>`).join(' ')}\n## Report against <@${authorId}> \`${authorId}\`\n* __Submitted By__: <@${message.author.id}>. \`${message.author.id}\`\n* __In Channel__: <#${message.channel.id}>.\n* __Timestamp__: <t:${Math.floor(Date.now() / 1000)}:f>.\n\n:notepad_spiral: **Reason:** \`${reportReason}\`\n:pencil2: **Attached Message**: \`\`\`${referencedMessage.content || 'Empty or contains an image.'}\`\`\`\n-# Below are recent messages sent by the reported user.`)).setThumbnailAccessory(new ThumbnailBuilder().setURL(`https://cdn.discordapp.com/avatars/${authorId}/${referencedMessage.author.avatar}.png`))).addSeparatorComponents(new SeparatorBuilder());

        for (const userMessage of userMessages) {
            let content = userMessage.content || "Empty or contains an image.";
            if (content.length > 4000) {
                content = content.slice(0, 3997) + '...';
            }

            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${content}\n`))
                    .setButtonAccessory(
                        new ButtonBuilder()
                            .setLabel(`Jump`)
                            .setURL(`https://discord.com/channels/${userMessage.guildId}/${userMessage.channelId}/${userMessage.id}`)
                            .setStyle(ButtonStyle.Link)
                    )
            ).addSeparatorComponents(new SeparatorBuilder());
        }

        container.addSectionComponents(new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("Finished with the report?")).setButtonAccessory(new ButtonBuilder().setLabel("Mark as Resolved").setStyle(ButtonStyle.Success).setCustomId(`markAsResolved_button`)));

        await message.client.channels.cache.get(reportsChannelId)?.send({
            flags: MessageFlags.IsComponentsV2, components: [container], allowedMentions: {
                parse: ['roles'],
                users: [],
                repliedUser: false
            }
        }).catch(error => {
            async () => {
                const user = await message.client.users.fetch(message.author.id);
                await user.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(':x: **An error occurred while submitting your report.**\n-# Please open a ticket if this issue persists.')
                            )
                    ]
                })
                console.log(`Report Error: ${error}`);
            }
            
        });

        await message.delete();
    },
};
