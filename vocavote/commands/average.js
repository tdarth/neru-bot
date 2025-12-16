const { SlashCommandSubcommandBuilder, AttachmentBuilder } = require('discord.js');
const ContainerMessage = require('../utils/classes/ContainerMessage');

function getStandardDeviation(array) {
    const n = array.length;
    const mean = array.reduce((a, b) => Number(a) + Number(b)) / n;
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function getIQR(arr) {
    if (!arr.length) return 0;

    const nums = arr
        .map(x => Number(x))
        .filter(x => !isNaN(x));

    if (!nums.length) return 0;

    const sorted = nums.sort((a, b) => a - b);

    function percentile(data, p) {
        const pos = (data.length - 1) * p;
        const base = Math.floor(pos);
        const rest = pos - base;

        if (base + 1 < data.length) {
            return data[base] + rest * (data[base + 1] - data[base]);
        } else {
            return data[base];
        }
    }

    const q1 = percentile(sorted, 0.25);
    const q3 = percentile(sorted, 0.75);

    return q3 - q1;
}

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('average')
        .setDescription('Returns averaged song data from a datamusic file')
        .addAttachmentOption((option) => option.setName('datamusic-file').setDescription('The data file').setRequired(true))
        .addStringOption((option) => option.setName('song-count').setDescription('Each user must have at least this many votes to be counted'))
        .addStringOption((option) => option.setName('ignore-users').setDescription('Usernames/UserIDs seperated with a comma'))
        .addStringOption((option) => option.setName('ignore-songs').setDescription('Songs in slug format seperated with a comma')),
    async execute(interaction) {
        try {
            const dataMusic = interaction?.options?.getAttachment('datamusic-file') || null;
            const songCount = interaction?.options?.getString('song-count') || 0;
            const ignoreUsers = interaction?.options?.getString('ignore-users') || null;
            const ignoreSongs = interaction?.options?.getString('ignore-songs') || null;

            const messages = [];
            let ignoredUsers = [];
            let ignoredSongs = [];
            let place = 1;
            let place2 = 1;
            let place3 = 1;

            const storedData = new Map();
            let finalData = new Map();
            let finalData2 = new Map();
            let finalData3 = new Map();

            const printData = [];
            const printData2 = [];
            const printData3 = [];

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
                finalData2.set(songName, getStandardDeviation(allVotes));
                finalData3.set(songName, getIQR(allVotes));
            }

            finalData = new Map([...finalData.entries()].sort((a, b) => b[1] - a[1]));
            finalData2 = new Map([...finalData2.entries()].sort((a, b) => b[1] - a[1]));
            finalData3 = new Map([...finalData3.entries()].sort((a, b) => b[1] - a[1]));

            for (const [songName, score] of finalData) {
                printData.push(`#${place} ${songName}: ${score}`);
                place++;
            }

            for (const [songName, mad] of finalData2) {
                printData2.push(`#${place2} ${songName}: ${mad}`);
                place2++;
            }

            for (const [songName, iqr] of finalData3) {
                printData3.push(`#${place3} ${songName}: ${iqr}`);
                place3++;
            }

            const files = [];

            files.push(new AttachmentBuilder(Buffer.from(printData.join('\n')), { name: 'datamusic-avg.txt' }));
            files.push(new AttachmentBuilder(Buffer.from(printData2.join('\n')), { name: 'datamusic-sd.txt' }));
            files.push(new AttachmentBuilder(Buffer.from(printData3.join('\n')), { name: 'datamusic-iqr.txt' }));
            if (messages.length > 0) files.push(new AttachmentBuilder(Buffer.from(messages.join('\n')), { name: 'datamusic-messages.txt' }));

            await interaction.reply({
                content: '`avg` - Higher = generally liked, Lower = generally disliked.\n`sd ` - Higher = more divided opinions, Lower = more agreement.\n`iqr` - Same as SD, but removing 25% of the lower and upper votes (the outliers).',
                files: files
            });
        } catch (e) {
            console.log(`Graph command error: ${e}`);
            await interaction.reply(new ContainerMessage(':x: **An error occurred.**\n-# Are you using the correct file type?').isEphemeral().build());
        }
    }
};