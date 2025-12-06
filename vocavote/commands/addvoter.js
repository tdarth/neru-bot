const { SlashCommandSubcommandBuilder, ChannelType } = require('discord.js');
const { messages } = require('../messages.json');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('addvoter')
        .setDescription('Adds a voter')
        .addUserOption((option) => option.setName('user').setDescription('The user to add').setRequired(true)),
    async execute(interaction) {
        if (interaction?.user?.id != interaction?.guild?.ownerId) return await interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSIONS.replace('{0}', 'SERVER_OWNER')).isEphemeral().build());

        const user = interaction.options.getUser('user');
        await interaction.guild.channels.fetch();
        
        const voteChannels = [];

        voteChannels.forEach(channel => {
            if (channel?.topic != 'VocaVote Channel (do not edit this!)') return;
            voteChannels.push(channel);
        });

        let index = 0;

        await interaction.reply(new ContainerMessage(`<a:spinner:1445581140688637992> \`(${index}/${voteChannels.length})\` Adding <@${user.id}>...`).isEphemeral().build());

        for (const voteChannel of voteChannels) {
            try {
                await voteChannel.permissionOverwrites.edit(
                    user.id,
                    { ViewChannel: true }
                );

                index++;

                await interaction.editReply(new ContainerMessage(`<a:spinner:1445581140688637992> \`(${index}/${voteChannels.length})\` Adding <@${user.id}>...`).isEphemeral().build());


            } catch (e) {
                await interaction.editReply(new ContainerMessage(`:x: **An error occurred.**`).isEphemeral().build());
                console.error(`Addvoter command error: ${e}`);
                return;
            };
        }

        await interaction.editReply(new ContainerMessage(`:white_check_mark: **Added <@${user.id}>.**`).isEphemeral().build());
    }
};