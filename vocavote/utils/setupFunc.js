const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { songs } = require('../songs.json');
const { users } = require('../users.json');
const ContainerMessage = require('./classes/ContainerMessage');

async function setup(interaction) {
    await interaction.guild.members.fetch();

    let songIndex = 0;
    let categoryCount = 0;
    const totalCategories = Math.ceil(songs.length / 50);

    const permissions = users.voters.map(voter => ({
        id: voter,
        allow: [PermissionFlagsBits.ViewChannel]
    }));
    permissions.push({ id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] });

    let category = await interaction.guild.channels.create({
        name: 'VocaVote',
        type: ChannelType.GuildCategory,
        permissionOverwrites: permissions,
    });

    categoryCount++;

    async function updateProgress() {
        await interaction.editReply(new ContainerMessage(
            `:white_check_mark: **Cache guild members.**\n` +
            `${categoryCount == totalCategories ? ':white_check_mark:' : '<a:spinner:1445581140688637992>'} \`(${categoryCount}/${totalCategories})\` **Create channel categories.**\n` +
            `<a:spinner:1445581140688637992> \`(${songIndex}/${songs.length})\` **Create song channels.**`
        ).isEphemeral().build());
    }

    await updateProgress();

    for (const entry of songs) {
        let created = false;
        while (!created) {
            try {
                const url = entry?.song?.url || null;
                const channel = await interaction.guild.channels.create({
                    name: entry.song.name,
                    type: ChannelType.GuildText,
                    topic: 'VocaVote Channel (do not edit this!)',
                    parent: category.id,
                });

                if (url) await channel.send(url);

                created = true;
                songIndex++;

                await updateProgress();

                if (songIndex % 50 === 0 && songIndex < songs.length) {
                    category = await interaction.guild.channels.create({
                        name: 'VocaVote',
                        type: ChannelType.GuildCategory,
                        permissionOverwrites: permissions,
                    });
                    categoryCount++;
                }
            } catch (e) {
                if (String(e).includes("Maximum number of channels in category reached (50)")) {
                    category = await interaction.guild.channels.create({
                        name: 'VocaVote',
                        type: ChannelType.GuildCategory,
                        topic: 'VocaVote Channel (do not edit this!)',
                        permissionOverwrites: permissions,
                    });
                    categoryCount++;
                } else if (String(e).includes('Maximum number of server channels reached (500)')) {
                    created = true
                } else {
                    console.error(e);
                    created = true;
                }
            }
        }
    }

    await interaction.editReply(new ContainerMessage(
        `:white_check_mark: **Cache guild members.**\n` +
        `${categoryCount == totalCategories ? ':white_check_mark:' : '<a:spinner:1445581140688637992>'} \`(${categoryCount}/${totalCategories})\` **Create channel categories.**\n` +
        `<a:spinner:1445581140688637992> \`(${songIndex}/${songs.length})\` **Create song channels.**`
    ).isEphemeral().build());
}

module.exports = { setup };