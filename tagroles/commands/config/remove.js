const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const ContainerMessage = require('../../utils/ContainerMessage');
const { messages } = require('../../messages.json');
const { deleteData } = require('../../utils/dataHelper');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('remove')
        .setDescription("Remvoes a role to give out")
        .addRoleOption(option => option.setName('role').setDescription('The role to give out').setRequired(true))
        .addStringOption(option => option.setName('tag').setDescription('The tag required to receive the role').setRequired(true))
        .addStringOption(option => option.setName('server-id').setDescription('The server id/invite that contains the guild tag').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
        const role = interaction.options.getRole('role');
        const tag = interaction.options.getString('tag');
        let serverId = interaction.options.getString('server-id');

        const inviteRegex = /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord\.com\/invite)\/([a-zA-Z0-9\-]+)/;

        const match = serverId.match(inviteRegex);
        if (match) {
            try {
                const invite = await interaction.client.fetchInvite(serverId);
                if (invite?.guild?.id) serverId = invite.guild.id;
                else {
                    return interaction.reply(new ContainerMessage(messages.errors.GUILD_INVITE_NOT_FOUND).isEphemeral().build());
                }
            } catch {
                return interaction.reply(new ContainerMessage(messages.errors.GUILD_INVITE_ERROR).isEphemeral().build());
            }
        } else if (isNaN(serverId)) {
            return interaction.reply(new ContainerMessage(messages.errors.GUILD_INVITE_ERROR).isEphemeral().build());
        }

        const deleted = await deleteData(interaction.guild.id, tag, role.id, serverId);

        if (deleted) {
            await interaction.reply(
                new ContainerMessage(`:wastebasket: <@&${role.id}> will no longer be given out for: \`${tag}\`.\n-# From Server ID: \`${serverId}\`.`).build()
            );
        } else {
            await interaction.reply(
                new ContainerMessage(`❌ No role found for \`${tag}\` with that serverId.`).isEphemeral().build()
            );
        }
    }
};