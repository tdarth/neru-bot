const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('discord.js');
const { prefix } = require('../../config.json');

module.exports = {
    name: 'mutedinfo',
    trigger: (message) => message.content.startsWith(`${prefix}mutedinfo`),
    async execute(message) {
        if (message.author.id !== '990500436047982602') return;

        await message.client.channels.cache.get(message.channel.id)?.send({
            flags: MessageFlags.IsComponentsV2,
            components: [
                new ContainerBuilder()
                    .addSeparatorComponents(new SeparatorBuilder().setSpacing(2))
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# <:muted:1400298861360320564> Muted\n-# Viewing & chatting in channels has been disabled.`)
                    )
                    .addSeparatorComponents(new SeparatorBuilder().setSpacing(2)),
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`:warning: Read the <#1394927984695054377>.\n-# - An __escalated punishment__ will enforced on repeated offenses.`)
                    ),
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`:x: Questions or Concerns? Please directly message <@990500436047982602>.\n-# Your mute expiration time & reason have been directly messaged to you.`)
                    )
            ],
            allowedMentions: { parse: [] }
        })

        await message.delete();
    },
};
