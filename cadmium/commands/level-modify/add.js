const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateUserData } = require('../../utils/user/updateUserData');
const { getLevel } = require('../../utils/leveling/getLevel');
const { formatNumber } = require('../../utils/formatNumber');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription("Add Levels to a member")
        .addUserOption(option => option.setName('member').setDescription('The member to modify').setRequired(true))
        .addStringOption(option => option.setName('amount').setDescription('The amount').setRequired(true)),
	async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
        const amount = formatNumber(parseInt(interaction.options.getString('amount'), 10));
        if (isNaN(amount)) return interaction.reply(new ContainerMessage(messages.errors.MUST_BE_NUMBER.replaceAll('{argument}', 'amount')).isEphemeral().build());

        const user = interaction.options.getUser('member');
        const oldData = await getLevel(interaction.guild.id, interaction.user.id);
        await updateUserData(interaction.guild.id, interaction.user.id, 'level', oldData.level + amount);
        const newData = await getLevel(interaction.guild.id, interaction.user.id);

        await interaction.reply(new ContainerMessage(messages.success.ADDED_LEVEL
            .replaceAll('{amount}', amount.toLocaleString())
            .replaceAll('{user}', `<@${user.id}>`)
            .replaceAll('{oldLevel}', `${oldData.level.toLocaleString()}`)
            .replaceAll('{newLevel}', `${newData.level.toLocaleString()}`)
        ).build());
    }
};