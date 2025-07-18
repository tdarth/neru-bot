const { MessageFlags, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const replyWithText = require('../../utils/replyWithText');

module.exports = {
    name: 'cat',
    trigger: (message) => message.content.startsWith(`${prefix}cat`),
    async execute(message) {
        const container = new ContainerBuilder();

        let catAmount = message.content.replaceAll(`${prefix}cat`, '').trim() || 1;
        if (catAmount > 39) catAmount = 39;

        if (message.channel.id !== '1369383513132105874' && catAmount > 1) {
            catAmount = 1;
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(':warning: **You can only specify a value above 1 in <#1369383513132105874>**.'))
        }

        if (isNaN(catAmount)) return replyWithText(message, `:x: **?cat <1-39>**`);

        await message.channel.sendTyping();

        const response = await fetch(`https://api.thecatapi.com/v1/images/search?limit=${catAmount}&api_key=${process.env.CAT_API_KEY}`);
        if (!response.ok) { console.log(`Cat Command Error: ${response.status} ${response.statusText}`); replyWithText(message, `:x: **An error occurred.**`); }

        const data = await response.json();

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

        await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        }).catch(error => replyWithText(message, `:x: **An error occurred.**`) | console.log(`Cat Command Error: ${error}`))
    },
};
