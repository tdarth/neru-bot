const { SlashCommandSubcommandBuilder, PermissionsBitField } = require('discord.js');
const { updateServerConfig } = require('../../utils/server/updateServerConfig');
const { messages } = require('../../messages.json');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('levelup-card-titlename')
        .setDescription("Toggles if the level up card title displays the username or displayname")
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('The card title display mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Username', value: 'username' },
                    { name: 'Displayname', value: 'displayname' },
                )),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
        const mode = interaction.options.getString('mode');
        const configChange = (mode == 'displayname') ? '1' : '0';

        await updateServerConfig(interaction.guild.id, 'level_up_message_card_displayname_enabled', configChange);
        await interaction.reply(new ContainerMessage(messages.success.UPDATE_CONFIG_VALUE.replaceAll('{config}', 'Level Up Card Title').replaceAll('{value}', mode)).build());
    }
};