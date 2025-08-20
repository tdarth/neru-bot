const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateUserData } = require('../../utils/user/updateUserData');
const { getServerConfig } = require('../../utils/server/getServerConfig');
const { modifyLevelRolesForUser } = require('../../utils/level-roles/modifyLevelRolesForUser');
const { fetchLevelRoles } = require('../../utils/level-roles/fetchLevelRoles');
const { getLevel } = require('../../utils/leveling/getLevel');
const { formatNumber } = require('../../utils/formatNumber');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('remove')
        .setDescription("Remove Levels from a member")
        .addUserOption(option => option.setName('member').setDescription('The member to modify').setRequired(true))
        .addStringOption(option => option.setName('amount').setDescription('The amount').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
        const amount = formatNumber(parseInt(interaction.options.getString('amount'), 10));
        if (isNaN(amount)) return interaction.reply(new ContainerMessage(messages.errors.MUST_BE_NUMBER.replaceAll('{argument}', 'amount')).isEphemeral().build());

        const serverId = serverId;
        const serverConfig = await getServerConfig(serverId);

        const user = interaction.options.getUser('member');
        const oldData = await getLevel(serverId, user.id);
        await updateUserData(serverId, interaction.user.id, 'level', Math.max(oldData.level - amount, 0));
        const newData = await getLevel(serverId, user.id);

        const stack = serverConfig.stack_level_roles_enabled;
        const roles = await fetchLevelRoles(serverId, newData.level, stack);
        await modifyLevelRolesForUser(user, roles, stack)

        await interaction.reply(new ContainerMessage(messages.success.REMOVED_LEVEL
            .replaceAll('{amount}', amount.toLocaleString())
            .replaceAll('{user}', `<@${user.id}>`)
            .replaceAll('{oldLevel}', oldData.level.toLocaleString())
            .replaceAll('{newLevel}', newData.level.toLocaleString())
            .replaceAll('{oldXp}', oldData.xp.toLocaleString())
            .replaceAll('{newXp}', oldData.xp.toLocaleString())
        ).build());
    }
};