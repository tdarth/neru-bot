const { Events } = require('discord.js');
const ContainerMessage = require('../utils/classes/ContainerMessage');
const { getAnilistToken, getId } = require('../utils/getAnilistToken');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        const buttonId = interaction?.customId;

        try {
            if (buttonId.startsWith("check_link")) {
                await interaction.deferUpdate();

                const idToCheck = buttonId.split(':')[1] || null;
                if (!idToCheck) return interaction.followUp(new ContainerMessage(':x: **An unknown error occurred.**').isEphemeral().build())

                const token = await getAnilistToken(idToCheck);

                if (typeof token === 'string' && !['user_not_linked', 'user_token_expire'].includes(token) && !token.startsWith('Error:')) {
                    await interaction.deleteReply();
                    return await interaction.followUp(new ContainerMessage(`:white_check_mark: **Account Linked!** </wrapped:1450971543852158988> is now available.\n-# > https://anilist.co/user/${await getId(interaction.user.id)}`).isEphemeral().build());
                }

                else return interaction.followUp(new ContainerMessage(':x: **Account not linked.** Please wait up to 5 minutes before trying again.').isEphemeral().build())
            }
        } catch (e) {
            console.log(e);
        }
    },
};