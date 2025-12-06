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

        const msg = await interaction.reply({
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`<a:spinner:1445581140688637992> \`(0/${voteChannels.length})\` Adding <@${user.id}>...`)
                    )
            ],
            allowedMentions: {
                parse: []
            }
        });

        for (const voteChannel of voteChannels) {
            try {
                await voteChannel.permissionOverwrites.edit(
                    user.id,
                    { ViewChannel: true }
                );

                index++;

                await msg.edit({
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`<a:spinner:1445581140688637992> \`(${index}/${voteChannels.length})\` Adding <@${user.id}>...`)
                            )
                    ],
                    allowedMentions: {
                        parse: []
                    }
                });
            } catch (e) {
                await msg.edit({
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`:x: **An error occurred.**`)
                            )
                    ],
                    allowedMentions: {
                        parse: []
                    }
                });
                break;
            };

            await msg.edit({
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`:white_check_mark: **Added <@${user.id}>.**`)
                        )
                ],
                allowedMentions: {
                    parse: []
                }
            });

        }
    }
};