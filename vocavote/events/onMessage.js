const { Events, PermissionFlagsBits } = require('discord.js');
const { store } = require('../utils/store');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        if (message.guild) {
            if (message?.channel?.topic != "VocaVote Channel (do not edit this!)") return;

            const num = Number(message?.content);

            if (isNaN(num) || num < 1 || num > 10) {
                const msg = await message.reply(new ContainerMessage(':x: **Please only type a number 1-10.**').build());
                setTimeout(async () => {
                    try {
                        await message.delete();
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
                await message.channel.permissionOverwrites.set([{
                    id: message.author.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                }])
            } catch (err) {
                console.error(`Error: ${err}`);
            }

        }
    },
};