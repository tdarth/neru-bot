const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { forceAddXp } = require('../../utils/leveling/forceAddXp');
const { getLevel } = require('../../utils/leveling/getLevel');
const { formatNumber } = require('../../utils/formatNumber');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription("Add XP to a member")
        .addUserOption(option => option.setName('member').setDescription('The member to modify').setRequired(true))
        .addStringOption(option => option.setName('amount').setDescription('The amount').setRequired(true)),
	async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
        const amount = formatNumber(parseInt(interaction.options.getString('amount'), 10), 10000);
        if (isNaN(amount)) return interaction.reply(new ContainerMessage(messages.errors.MUST_BE_NUMBER.replaceAll('{argument}', 'amount')).isEphemeral().build());

        const user = interaction.options.getUser('member');
        const oldData = await getLevel(interaction.guild.id, interaction.user.id);
        await forceAddXp(interaction.guild.id, user.id, amount);
        const newData = await getLevel(interaction.guild.id, interaction.user.id);

        const levelsGained = newData.level - oldData.level;
        let replyMessage = messages.success.ADDED_XP
            .replaceAll('{amount}', amount.toLocaleString())
            .replaceAll('{user}', `<@${user.id}>`)
            .replaceAll('{oldXp}', oldData.xp.toLocaleString())
            .replaceAll('{newXp}', newData.xp.toLocaleString())
            .replaceAll('{totalXp}', newData.totalXp.toLocaleString())
            .replaceAll('{oldLevel}', oldData.level.toLocaleString())
            .replaceAll('{newLevel}', newData.level.toLocaleString())
            .replaceAll('{gainedLevels}', levelsGained);

        await interaction.reply(new ContainerMessage(replyMessage).build());
    }
};