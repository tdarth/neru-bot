const { Events } = require('discord.js');
const { store } = require('../utils/store');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        if (message.guild) {
            if (message?.channel?.topic != "VocaVote Channel (do not edit this!)") return;
            if (message?.content?.startsWith('send ') && message.author.id == message.guild.ownerId) {
                try {
                    await message.delete()
                    return await message.channel.send(message?.content?.replace('send ', ''))
                } catch (err) {
                    console.error(`Error: ${err}`);
                }
            }

            const num = Number(message?.content);

            if (isNaN(num) || num < 0 || num > 10) {
                const msg = await message.reply(new ContainerMessage(':x: **Please only type a number 0-10.**').build());
                await message.delete();
                setTimeout(async () => {
                    try {
                        await msg.delete();
                    } catch (e) {
                        return
                    }
                }, 5000);
                return
            }

            try {
                store('./datamusic.json', message?.author?.id || Math.floor(Math.random() * 10000), message?.author?.username, message?.channel?.name, message.content);
                await message.delete();
                await message.channel.permissionOverwrites.edit(
                    message.author.id,
                    { ViewChannel: false }
                );
            } catch (err) {
                console.error(`Error: ${err}`);
            }

        }
    },
};