const { SlashCommandSubcommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
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
            await interaction.reply(new ContainerMessage('<a:spinner:1445581140688637992> **Loading..**').build());

            const { data } = await retrieve('./datamusic.json');
            if (!data) return await interaction.editReply(new ContainerMessage(':x: **No data found.**').isEphemeral().build());

            let progress = new Map();
            let ids = [];

            data.users.forEach(user => {
                progress.set(`${user.username} (${user.id})`, user.votes.length);
                ids.push(user.id);
            });

            for (const userid of users.voters) {
                if (!ids.includes(userid)) {
                    const fetchedUser = await interaction.client.users.fetch(userid);
                    progress.set(`${fetchedUser.username || 'unknown'} (${userid})`, 0)
                }
            }

            progress = [
                `${songs.length} total songs, ${users.voters.length} users.\n`,
                ...[...progress.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .map(([username, count]) => `${username}: ${count}`)
            ].join("\n");

            const buffer = Buffer.from(progress, "utf-8");

            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                files: [
                    new AttachmentBuilder(buffer, { name: `${Date.now()}-progress.txt` })
                ]
            });

            console.log(progress)
        } catch (e) {
            console.log(`Progress command error: ${e}`);
            await interaction.editReply(new ContainerMessage(':x: **An error occurred.**').isEphemeral().build());
        }
    }
};