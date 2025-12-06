const { SlashCommandSubcommandBuilder, AttachmentBuilder } = require('discord.js');
const { retrieve } = require('../utils/store');
const { songs } = require('../songs.json')
const { users } = require('../users.json')
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('progress')
        .setDescription('View the current voting progress'),
    async execute(interaction) {
        try {
            const { data } = await retrieve('./datamusic.json');
            if (!data) return await interaction.reply(new ContainerMessage(':x: **No data found.**').isEphemeral().build());

            const votesByUserId = new Map();
            data.users.forEach(user => {
                votesByUserId.set(user.id, user.votes.length);
            });

            const progressEntries = [];

            for (const userId of users.voters) {
                const voteCount = votesByUserId.get(userId) || 0;

                let username;

                const userData = data.users.find(u => u.id === userId);
                if (userData) {
                    username = userData.username;
                } else {
                    try {
                        const member = await interaction.guild.members.fetch(userId);
                        username = member.user.username;
                    } catch {
                        username = userId;
                    }
                }

                progressEntries.push([`${username} (${userId})`, voteCount]);
            }

            const progress = [
                `${songs.length} total songs, ${users.voters.length} users.\n`,
                ...progressEntries.map(([username, count]) => `${username}: ${count}`)
            ].join("\n");

            const buffer = Buffer.from(progress, "utf-8");

            await interaction.reply({
                files: [
                    new AttachmentBuilder(buffer, { name: `${Date.now()}-progress.txt` })
                ]
            });
        } catch (e) {
            console.log(`Progress command error: ${e}`);
            await interaction.reply(new ContainerMessage(':x: **An error occurred.**').isEphemeral().build());
        }
    }
};