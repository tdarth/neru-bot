const { SlashCommandSubcommandBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { retrieve } = require('../utils/store');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('votes')
        .setDescription('View your current votes'),
    async execute(interaction) {
        try {
            const contents = await retrieve('./datamusic.json', interaction?.user?.id);
            if (!contents) return await interaction.reply(new ContainerMessage(':x: **No data found.**').build());

            const string = JSON.stringify(contents, null, 2);
            const buffer = Buffer.from(string, "utf-8");

            await interaction?.user?.send({
                files: [
                    new AttachmentBuilder(buffer, { name: `${interaction?.user?.id}-votes.json` })
                ]
            });

            await interaction?.reply(new ContainerMessage(':white_check_mark: **Check your DMs.**').isEphemeral().build());
        } catch (e) {
            console.log(`Votes command error: ${e}`);
            await interaction.reply(new ContainerMessage(':x: **An error occurred.**\n-# Are your DMs enabled?').isEphemeral().build());
        }
    }
};