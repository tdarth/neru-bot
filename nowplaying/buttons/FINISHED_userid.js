const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const ContainerMessage = require('../utils/classes/ContainerMessage');
const { emojis } = require('../config.json');
const { getUserData } = require('../utils/lastfm/getUserData');
const { getSessionToken } = require('../utils/lastfm/getSessionToken');

module.exports = {
    id: 'FINISHED_',
    async execute(interaction, id) {
        await interaction.deferReply();
        const session = await getSessionToken(id);

        await interaction.deleteReply();

        if (!session) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **Your account is not linked.**`).isEphemeral().build());
        else {
            const userData = await getUserData(session);
            if (userData) return await interaction.followUp(new ContainerMessage(`**Account Linked!**\n${userData.user.url}`).addSecondaryComponents([new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Log out').setURL(`https://www.last.fm/settings/applications`).setStyle(ButtonStyle.Link))]).isEphemeral().build());
        }
    }
}