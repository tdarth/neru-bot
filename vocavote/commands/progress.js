const { SlashCommandSubcommandBuilder, AttachmentBuilder } = require('discord.js');
const { retrieve } = require('../utils/store');
const { songs } = require('../songs.json')
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('progress')
        .setDescription('View the current voting progress'),
    async execute(interaction) {
        try {
            const { data } = await retrieve('./datamusic.json');
            if (!data) return await interaction.reply(new ContainerMessage(':x: **No data found.**').isEphemeral().build());

            let progress = new Map();

            data.users.forEach(user => {
                progress.set(`${user.username} (${user.id})`, user.votes.length);
            });

            progress = [
                `${songs.length} total songs\n`,
                ...[...progress.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .map(([username, count]) => `${username}: ${count}`)
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