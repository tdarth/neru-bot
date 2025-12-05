const { SlashCommandSubcommandBuilder, AttachmentBuilder } = require('discord.js');
const { retrieve } = require('../utils/store');
const { messages } = require('../messages.json');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('allvotes')
        .setDescription('View all current votes (admin only)'),
    async execute(interaction) {
        if (interaction?.user?.id != interaction?.guild?.ownerId) return await interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSIONS.replace('{0}', 'SERVER_OWNER')).isEphemeral().build());

        try {
            const contents = await retrieve('./datamusic.json');
            if (!contents) return await interaction.reply(new ContainerMessage(':x: **No data found.**').isEphemeral().build());

            const string = JSON.stringify(contents, null, 2);
            const buffer = Buffer.from(string, "utf-8");

            await interaction?.user?.send({
                files: [
                    new AttachmentBuilder(buffer, { name: `${Date.now()}-all-votes.json` })
                ]
            });

            await interaction?.reply(new ContainerMessage(':white_check_mark: **Check your DMs.**').isEphemeral().build());
        } catch (e) {
            console.log(`Votes command error: ${e}`);
            await interaction.reply(new ContainerMessage(':x: **An error occurred.**\n-# Are your DMs enabled?').isEphemeral().build());
        }
    }
};