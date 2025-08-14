const { SlashCommandSubcommandBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder } = require('discord.js');
const { forceAddXp } = require('../../utils/leveling/forceAddXp');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('force-add-xp')
        .setDescription("Force adds xp")
        .addStringOption(option => option.setName('amount').setDescription('The amount').setRequired(true))
        .addStringOption(option => option.setName('id').setDescription('The user id').setRequired(true)),
	async execute(interaction) {
        const amount = parseInt(interaction.options.getString('amount'), 10);
        if (isNaN(amount)) return interaction.reply(new ContainerMessage('Amount must be a number.').build());

        const id = interaction.options.getString('id');
        const member = interaction.guild.members.fetch(id);

        await forceAddXp(interaction.guild.id, id, member.username, amount);
        await interaction.reply(new ContainerMessage(`Added ${amount} to <@${id}> ${id}`).build());
    }
};