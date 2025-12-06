const { SlashCommandSubcommandBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { messages } = require('../messages.json');
const { songs } = require('../songs.json')
const { users } = require('../users.json')
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('addvoter')
        .setDescription('Adds a voter')
        .addUserOption((option) => option.setName('user').setDescription('The user to add')),
    async execute(interaction) {
        if (interaction?.user?.id != interaction?.guild?.ownerId) return await interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSIONS.replace('{0}', 'SERVER_OWNER')).isEphemeral().build());

        const user = interaction.options.getUser('user');
        const channels = await interaction.guild.channels.fetch();
        const voteChannels = Array.from(channels.filter(channel => channel.topic && channel.topic == 'VocaVote Channel (do not edit this!)'));

        let index = 0;

        const msg = await interaction.reply(new ContainerMessage(`<a:spinner:1445581140688637992> \`(${index}/${voteChannels.length})\` Adding <@${user.id}>...`).isEphemeral().build());

        for (const voteChannel of voteChannels) {
            try {
                await voteChannel.permissionOverwrites.edit(
                    user.id,
                    { ViewChannel: true }
                );

                index++;

                await msg.edit(new ContainerMessage(`<a:spinner:1445581140688637992> \`(${index}/${voteChannels.length})\` Adding <@${user.id}>...`).isEphemeral().build());


            } catch (e) {
                await msg.edit(new ContainerMessage(`:x: **An error occurred.**`).isEphemeral().build());
                console.log(`Addvoter command error: ${e}`);
                break;
            };
        }

        await msg.edit(new ContainerMessage(`:white_check_mark: **Added <@${user.id}>.**`).isEphemeral().build());
    }
};