const { Events, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { store, retrieve } = require('../utils/store');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        if (message.channel.type === 1) {
            if (message.author.id != '990500436047982602' || !message.mentions.has(message.client.user.id)) return;

            try {
                const contents = await retrieve('./datamusic.json');
                if (!contents) return await message.reply(new ContainerMessage(':x: **An error occurred.**').isEphemeral().build());

                const string = JSON.stringify(contents, null, 2);
                const buffer = Buffer.from(string, "utf-8");

                await message.reply({
                    files: [
                        new AttachmentBuilder(buffer, { name: `datamusic.json` })
                    ]
                })
            } catch (e) {
                console.log(`DM error: ${e}`)
            }
        }

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
                await message.channel.permissionOverwrites.edit(
                    message.author.id,
                    { deny: [PermissionFlagsBits.ViewChannel] }
                );
            } catch (err) {
                console.error(`Error: ${err}`);
            }

        }
    },
};