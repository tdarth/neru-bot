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
        const minInput = interaction?.options?.getString('min');
        const maxInput = interaction?.options?.getString('max');

        const min = minInput !== null ? formatNumber(parseInt(minInput, 10)) : null;
        const max = maxInput !== null ? formatNumber(parseInt(maxInput, 10)) : null;

        if (min === null && max === null) {
            return interaction.reply(
                new ContainerMessage(
                    messages.errors.MISSING_ARGUMENT.replaceAll('{arguments}', 'min/max')
                ).isEphemeral().build()
            );
        }

        if ((minInput !== null && isNaN(min)) || (maxInput !== null && isNaN(max))) {
            return interaction.reply(
                new ContainerMessage(
                    messages.errors.MUST_BE_NUMBER.replaceAll('{argument}', 'min/max')
                ).isEphemeral().build()
            );
        }

        let value = [];

        if (min !== null) {
            await updateServerConfig(interaction.guild.id, 'xp_random_min', min);
            value.push(`min: ${min}`);
        }

        if (max !== null) {
            await updateServerConfig(interaction.guild.id, 'xp_random_max', max);
            value.push(`max: ${max}`);
        }

        await interaction.reply(
            new ContainerMessage(
                messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', 'XP Range').replaceAll('{value}', value)
            ).build()
        );
    }
};