const { SlashCommandSubcommandBuilder, AttachmentBuilder } = require('discord.js');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('average')
        .setDescription('Returns averaged song data from a datamusic file')
        .addAttachmentOption((option) => option.setName('datamusic-file').setDescription('The data file').setRequired(true))
        .addStringOption((option) => option.setName('song-count').setDescription('Each user must have at least this many votes to be counted').setRequired(true))
        .addStringOption((option) => option.setName('ignore-users').setDescription('Usernames/UserIDs seperated with a comma'))
        .addStringOption((option) => option.setName('ignore-songs').setDescription('Songs in slug format seperated with a comma')),
    async execute(interaction) {
        const dataMusic = interaction?.options?.getAttachment('datamusic-file') || null;
        const songCount = interaction?.options?.getString('song-count') || null;
        const ignoreUsers = interaction?.options?.getString('ignore-users') || null;
        const ignoreSongs = interaction?.options?.getString('ignore-songs') || null;

        const messages = [];
        let ignoredUsers = [];
        let ignoredSongs = [];
        let place = 1;

        const storedData = new Map();
        let finalData = new Map();

        const printData = [];

        const res = await fetch(dataMusic.url);
        if (!res.ok) return interaction.reply(new ContainerMessage(':x: **An error occurred.**'));

        const contents = await res.text();
        const songData = JSON.parse(contents).users;

        if (ignoreUsers) ignoredUsers = ignoreUsers.split(',');
        if (ignoreSongs) ignoredSongs = ignoreSongs.split(',');

        for (const user of songData) {
            if (ignoredUsers.includes(user.id) || ignoredUsers.includes(user.username)) {
                messages.push(`Ignoring user ${user.username} (${user.id}), included in ignored users list.`);
                continue;
            }

            if (songCount && user?.votes?.length < songCount) {
                messages.push(`Ignoring user ${user.username} (${user.id}), not enough songs. ${user?.votes?.length} < ${songCount}`);
                continue;
            }

            for (const vote of user.votes) {
                if (!vote?.song) continue;
                if (ignoredSongs.includes(vote.song)) { 
                    messages.push(`Ignoring vote for song ${vote.song}, score ${vote.vote}, included in ignored songs list.`)
                    continue;
                };

                if (storedData.has(vote.song)) {
                    storedData.get(vote.song).push(vote.vote);
                } else {
                    storedData.set(vote.song, [vote.vote]);
                }
            }
        };

        for (const [songName, allVotes] of storedData) {
            finalData.set(songName, allVotes.reduce((a, b) => Number(a) + Number(b)) / allVotes.length);
        }

        finalData = new Map([...finalData.entries()].sort((a, b) => b[1] - a[1]));

        for (const [songName, score] of finalData) {
            printData.push(`#${place} ${songName}: ${score}`);
            place++;
        }

        await interaction.reply({
            files: [
                new AttachmentBuilder(Buffer.from(printData.join('\n')), { name: 'datamusic.txt' }),
                new AttachmentBuilder(Buffer.from(messages.join('\n')), { name: 'datamusic-messages.txt' })
            ]
        });
    }
};