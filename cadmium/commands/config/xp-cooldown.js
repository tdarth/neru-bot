const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateServerConfig } = require('../../utils/server/updateServerConfig');
const { formatNumber } = require('../../utils/formatNumber');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('xp-cooldown')
        .setDescription("Sets the amount of seconds that is needed to wait before each message when granting xp")
        .addStringOption(option => option.setName('cooldown').setDescription('The cooldown in seconds').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
        const cooldown = formatNumber(parseInt(interaction.options.getString('cooldown'), 10));
        if (isNaN(cooldown) || cooldown < 0) return interaction.reply(new ContainerMessage(messages.errors.MUST_BE_NUMBER.replaceAll('{argument}', 'cooldown')).isEphemeral().build());

        await updateServerConfig(interaction.guild.id, 'xp_cooldown', cooldown);
        await interaction.reply(new ContainerMessage(messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', 'XP Cooldown').replaceAll('{value}', cooldown)).build());
    }
};