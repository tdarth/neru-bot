const { SlashCommandSubcommandBuilder, AttachmentBuilder } = require('discord.js');
const { retrieve } = require('../utils/store');
const { messages } = require('../messages.json');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('allvotes')
        .setDescription('View all current votes (admin only)')
        .addUserOption((option) => option.setName('from-user').setDescription('The user to view').setRequired(false)),
    async execute(interaction) {
        if (interaction?.user?.id != interaction?.guild?.ownerId) return await interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSIONS.replace('{0}', 'SERVER_OWNER')).isEphemeral().build());

        try {
            const fromUser = interaction?.options?.getUser('from-user')?.id || null;

            const result = await retrieve('./datamusic.json', fromUser);

            if (fromUser) {
                if (!result) return interaction.reply(new ContainerMessage(':x: **No data found for that user.**').isEphemeral().build());

                const string = JSON.stringify(result, null, 2);
                const buffer = Buffer.from(string, "utf-8");

                const files = [new AttachmentBuilder(buffer, { name: `${Date.now()}-${fromUser}-votes.json` })];

                await interaction.user.send({ files });
            } else {
                const { data, warnings } = result;

                if (!data) return await interaction.reply(new ContainerMessage(':x: **No data found.**').isEphemeral().build());

                const string = JSON.stringify(data, null, 2);
                const buffer = Buffer.from(string, "utf-8");

                const files = [new AttachmentBuilder(buffer, { name: `${Date.now()}-all-votes.json` })];

                if (warnings && warnings.length > 0) {
                    const warningText = warnings.join("\n");
                    const buffer2 = Buffer.from(warningText, "utf-8");

                    files.push(new AttachmentBuilder(buffer2, { name: `${Date.now()}-warnings.txt` }));
                }

                await interaction.user.send({ files });
            }

            interaction.reply(new ContainerMessage(':white_check_mark: **Check your DMs.**').isEphemeral().build());
        } catch (e) {
            console.log(`Votes command error: ${e}`);
            await interaction.reply(new ContainerMessage(':x: **An error occurred.**\n-# Are your DMs enabled?').isEphemeral().build());
        }
    }
};