const { Events, MessageFlags, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, FileUploadBuilder } = require('discord.js');
const { levelRoles } = require('../config.json');
const { customRoles, deleteCustomRoleEntry } = require('../utils/crHelper');
const replyWithText = require('../utils/replyWithText');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId == "boostMenu") {
            const value = interaction.values[0];

            if (value == 'boostMenu_manage') {
                if (interaction.user.id in customRoles) {
                    await interaction.reply({
                        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                        components: [
                            new ContainerBuilder()
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder()
                                        .setContent(":x: You already have a Custom Role, or a request in progress.")
                                )
                        ]
                    })

                    return;
                }

                const modal = new ModalBuilder().setCustomId('roleEdit').setTitle('Custom Role');

                const nameInput = new TextInputBuilder()
                    .setCustomId('crName')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(100)

                const nameLabel = new LabelBuilder()
                    .setLabel("Role Name")
                    .setDescription("This, alongside the Role Icon will be reviewed by server moderators.")
                    .setTextInputComponent(nameInput)

                const colorInput = new TextInputBuilder()
                    .setCustomId('crColor')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(15)
                    .setMinLength(7)

                const colorLabel = new LabelBuilder()
                    .setLabel("Role Color")
                    .setDescription("Hex only. For gradients, use 2 hex codes separated by a comma: #FFFFFF,#000000")
                    .setTextInputComponent(colorInput)

                const iconInput = new FileUploadBuilder()
                    .setCustomId('crIcon')

                const iconLabel = new LabelBuilder()
                    .setLabel("Role Icon")
                    .setDescription("File must be under 256 KB. Only .png and .jpg files are supported.")
                    .setFileUploadComponent(iconInput)

                const rulesLabel = new LabelBuilder()
                    .setLabel('I agree this role follows the rules.')
                    .setCheckboxComponent((checkbox) => checkbox.setCustomId('crRules'))

                modal
                    .addLabelComponents(nameLabel, colorLabel, iconLabel, rulesLabel);

                await interaction.showModal(modal);
            } else if (value == 'boostMenu_delete') {
                const roleEntry = customRoles[interaction.user.id] || null;

                if (!roleEntry || !roleEntry?.has_role) {
                    await interaction.reply({
                        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                        components: [
                            new ContainerBuilder()
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder()
                                        .setContent(":x: You must create a role before deleting it.")
                                )
                        ]
                    })

                    return;
                }

                try {
                    await interaction.guild.roles.delete(roleEntry?.role_id);
                } catch (e) {
                    await interaction.reply({
                        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                        components: [
                            new ContainerBuilder()
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder()
                                        .setContent(":x: An error occurred while deleting your role. **Please open a ticket to request it removed.**")
                                )
                        ]
                    })

                    console.log(`[NERU] Custom role failed to delete: ${e}`);
                }

                deleteCustomRoleEntry(interaction.user.id);

                await interaction.reply({
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(":white_check_mark: Role removed! You may create a new one anytime while your Server Boost is active.")
                            )
                    ]
                })
            }
        }
    },
};
