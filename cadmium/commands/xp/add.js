const { SlashCommandSubcommandBuilder } = require('discord.js');
const { forceAddXp } = require('../../utils/leveling/forceAddXp');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription("Add XP to a member")
        .addUserOption(option => option.setName('member').setDescription('The member to modify').setRequired(true))
        .addStringOption(option => option.setName('amount').setDescription('The amount').setRequired(true)),
	async execute(interaction) {
        const amount = parseInt(interaction.options.getString('amount'), 10);
        if (isNaN(amount)) return interaction.reply(new ContainerMessage(messages.errors.MUST_BE_NUMBER.replace('ARGUMENT', 'amount')).isEphemeral().build());

        const user = interaction.options.getUser('member');

        await forceAddXp(interaction.guild.id, user.id, user.username, amount);
        
        await interaction.reply(new ContainerMessage(messages.success.ADDED_XP
            .replace('AMOUNT', amount)
            .replace('USER', `<@${user.id}>`)
        ).build());
    }
};