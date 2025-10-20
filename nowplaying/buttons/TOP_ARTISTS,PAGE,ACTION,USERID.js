const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags, ThumbnailBuilder } = require('discord.js')
const ContainerMessage = require('../utils/classes/ContainerMessage');
const { emojis } = require('../config.json');
const { getUserData } = require('../utils/lastfm/getUserData');
const { getSessionToken } = require('../utils/lastfm/getSessionToken');
const { getTop } = require('../utils/lastfm/getTop');

module.exports = {
    id: 'TOP_ARTISTS',
    async execute(interaction, page, action, userid) {
        await interaction.deferUpdate();

        if (interaction.user.id != userid) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **Only** <@${userid}> **can use this button.**`).isEphemeral().build());

        const session = await getSessionToken(interaction.user.id) || null;
        if (!session) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **This command requires a Last.fm account.**\n-# Type </login:1429230213920985259> to connect.`).isEphemeral().build());

        const userData = await getUserData(session);
        if (!userData) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const top = await getTop(userData?.user?.name, "Artists", 100);
        if (!top) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const numArtists = top?.topartists?.artist?.length;

        page = Number(page);

        if (action == "FORWARD") page++;
        else if (action == "BACK") page--;
        else if (action == "LAST") page = numArtists;
        else if (action == "FIRST") page = 1;

        if (page - 1 >= numArtists || page <= 0) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **You have reached the final page in this direction.**`).isEphemeral().build());

        const artist = top?.topartists?.artist?.[page - 1] || null;
        if (!artist) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const container = new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ${artist?.url ? `[${artist?.name}]` : artist?.name}${artist?.url ? `(${artist?.url})` : ``}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`:trophy: **Rank:** ${artist?.['@attr']?.rank}/${numArtists}\n\`${Number(artist?.playcount).toLocaleString()}\` total plays.`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('1')
                    .setCustomId(`TOP_ARTISTS,${page},FIRST,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel('◀')
                    .setCustomId(`TOP_ARTISTS,${page},BACK,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel('▶')
                    .setCustomId(`TOP_ARTISTS,${page},FORWARD,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel(`${numArtists}`)
                    .setCustomId(`TOP_ARTISTS,${page},LAST,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary)
            )

        try {
            await interaction.message.edit({
                flags: MessageFlags.IsComponentsV2,
                components: [container, row]
            })
        } catch (e) {
            return console.log(`[NOWPLAYING] Error on top artists button: ${String(e)}`)
        }
    }
}