const { SlashCommandSubcommandBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder } = require('discord.js');
const forceAddXp = require('../../utils/leveling/forceAddXp');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('force-add-xp')
        .setDescription("Force adds xp")
        .addStringOption(option => option.setName('amount').setDescription('The amount').setRequired(true))
        .addStringOption(option => option.setName('id').setDescription('The user id').setRequired(true)),
	async execute(interaction) {
        const amount = interaction.options.getString('amount');
        const id = interaction.options.getString('id');

        await forceAddXp(interaction.guild.id, id, amount);
        await interaction.reply(new ContainerMessage(`Added ${amount} to <${id}> ${id}`).build());
    }
};