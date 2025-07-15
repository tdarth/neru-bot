const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MediaGalleryBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const replyWithText = require('../../utils/replyWithText');

module.exports = {
    name: 'cat',
    trigger: (message) => message.content.startsWith(`${prefix}cat`),
    async execute(message) {
        let catAmount = message.content.replaceAll(`${prefix}cat`, '').trim() || 1;
        if (catAmount > 40) catAmount = 40;

        if (isNaN(catAmount)) return replyWithText(message, `:x: **?cat <1-40>**`);

        await message.channel.sendTyping();

        const response = await fetch(`https://api.thecatapi.com/v1/images/search?limit=${catAmount}&api_key=${process.env.CAT_API_KEY}`);
        if (!response.ok) { console.log(`Cat Command Error: ${response.status} ${response.statusText}`); replyWithText(message, `:x: **An error occurred.**`); }

        const data = await response.json();
        const container = new ContainerBuilder();

        for (const cat of data) {
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems([
                        {
                            media: {
                                url: `${cat.url}`,
                            },
                        }
                    ])
            )
        }

        message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        })
    },
};
