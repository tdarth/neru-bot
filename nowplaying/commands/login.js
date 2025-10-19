const crypto = require('crypto');
const { SlashCommandSubcommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ContainerMessage = require('../utils/classes/ContainerMessage');
const { emojis } = require('../config.json')
const { getUserData } = require('../utils/lastfm/getUserData');
const { getSessionToken } = require('../utils/lastfm/getSessionToken');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('login')
        .setDescription('Connect your Last.fm account'),
    async execute(interaction) {
        const session = await getSessionToken(interaction.user.id) || null;

        if (session) {
            const userData = await getUserData(session);
            if (userData) return await interaction.reply(new ContainerMessage(`**Account Linked!**\n${userData.user.url}`).addSecondaryComponents([new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Log out').setURL(`https://www.last.fm/settings/applications`).setStyle(ButtonStyle.Link))]).isEphemeral().build());
        }

        const state = crypto.randomBytes(16).toString('hex');

        const response = await fetch(`${process.env.NP_API_URL}state`, {
            method: "POST",
            headers: {
                "x-api-key": process.env.NP_API_KEY
            },
            body: JSON.stringify({
                "state": state,
                "discord_id": interaction.user.id
            })
        })

        if (!response.ok) return await interaction.reply(`${emojis.ERROR} **Please try again later.**`);

        await interaction.reply(
            new ContainerMessage(`## Connecting to Last.fm\nWelcome to **nowplaying**!\n\nLinking your **Last.fm** account is required.\n> The following button will expire <t:${Math.floor((Date.now() + 5 * 60 * 1000) / 1000)}:R>.\n:star: After logging in, it may take up to **5 minutes** until changes are reflected within Discord.`)
                .addSecondaryComponents([
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel('Login to Last.fm')
                                .setURL(`https://www.last.fm/api/auth/?api_key=${process.env.LAST_FM_API_KEY}&cb=${process.env.NP_API_URL}callback?state=${state}`)
                                .setStyle(ButtonStyle.Link),
                            new ButtonBuilder()
                                .setCustomId(`FINISHED_${interaction.user.id}`)
                                .setLabel('Finished?')
                                .setStyle(ButtonStyle.Danger)
                        )
                ])
                .isEphemeral()
                .build()
        );
    }
};