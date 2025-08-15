const { SlashCommandSubcommandBuilder } = require('discord.js');
const { forceRemoveXp } = require('../../utils/leveling/forceRemoveXp');
const { getLevel } = require('../../utils/leveling/getLevel');
const { formatNumber } = require('../../utils/formatNumber');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('remove')
        .setDescription("Remove XP from a member")
        .addUserOption(option => option.setName('member').setDescription('The member to modify').setRequired(true))
        .addStringOption(option => option.setName('amount').setDescription('The amount').setRequired(true)),
	async execute(interaction) {
        const amount = formatNumber(parseInt(interaction.options.getString('amount'), 10));
        if (isNaN(amount)) return interaction.reply(new ContainerMessage(messages.errors.MUST_BE_NUMBER.replaceAll('{argument}', 'amount')).isEphemeral().build());

        const user = interaction.options.getUser('member');
        const oldData = await getLevel(interaction.guild.id, interaction.user.id);
        await forceRemoveXp(interaction.guild.id, user.id, amount);
        const newData = await getLevel(interaction.guild.id, interaction.user.id);
        
        await interaction.reply(new ContainerMessage(messages.success.REMOVED_XP
            .replaceAll('{amount}', amount.toLocaleString())
            .replaceAll('{user}', `<@${user.id}>`)
            .replaceAll('{old_amount}', `${oldData.xp.toLocaleString()} (${oldData.totalXp.toLocaleString()} total)`)
            .replaceAll('{new_amount}', `${newData.xp.toLocaleString()} (${newData.totalXp.toLocaleString()} total)`)
        ).build());
    }
};