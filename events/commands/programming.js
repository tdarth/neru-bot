const { MessageFlags, ContainerBuilder, MediaGalleryBuilder, AttachmentBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const replyWithText = require('../../utils/replyWithText');

module.exports = {
    name: 'programming',
    trigger: (message) => message.content.startsWith(`${prefix}programming`),
    async execute(message) {
        await message.channel.sendTyping();
        const response = await fetch(`https://cat-api-wrapper.tdarthh.workers.dev/anime?x=${Math.random()}`);
        const buffer = await response.arrayBuffer();
        const file = new AttachmentBuilder(Buffer.from(buffer), { name: 'programming.png' });

        await message.reply({
            flags: MessageFlags.IsComponentsV2,
            files: [file],
            components: [
                new ContainerBuilder()
                    .addMediaGalleryComponents(
                        new MediaGalleryBuilder()
                            .addItems([
                                {
                                    media: {
                                        url: `attachment://programming.png`,
                                    },
                                }
                            ])
                    )

            ]
        }).catch(error => replyWithText(message, `:x: **An error occurred.**`) | console.log(`Programming Command Error: ${error}`))
    },
};
