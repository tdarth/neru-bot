const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateServerConfig } = require('../../utils/server/updateServerConfig');
const { formatNumber } = require('../../utils/formatNumber');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('xp-range')
        .setDescription("Sets the ranges of XP granted")
        .addStringOption(option => option.setName('min').setDescription('The minimum amount'))
        .addStringOption(option => option.setName('max').setDescription('The maximum amount')),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
        const min = formatNumber(parseInt(interaction?.options?.getString('min'), 10));
        const max = formatNumber(parseInt(interaction?.options?.getString('max'), 10));
        if (!min && !max) return interaction.reply(new ContainerMessage(messages.errors.MISSING_ARGUMENT.replaceAll('{arguments}', 'min/max')).isEphemeral().build());
        if (isNaN(min) || isNaN(max)) return interaction.reply(new ContainerMessage(messages.errors.MUST_BE_NUMBER.replaceAll('{argument}', 'min/max')).isEphemeral().build());

        let value = [];

        if (min) { 
            await updateServerConfig(interaction.guild.id, 'xp_random_min', min);
            value.push(`min: ${min}`);
        }

        if (max) {
            await updateServerConfig(interaction.guild.id, 'xp_random_max', max);
            value.push(`max: ${max}`);
        }

        await interaction.reply(new ContainerMessage(messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', 'XP Range').replaceAll('{value}', value)).build());
    }
};