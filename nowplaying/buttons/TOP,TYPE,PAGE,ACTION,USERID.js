const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags, ThumbnailBuilder } = require('discord.js')
const ContainerMessage = require('../utils/classes/ContainerMessage');
const { emojis } = require('../config.json');
const { getUserData } = require('../utils/lastfm/getUserData');
const { getSessionToken } = require('../utils/lastfm/getSessionToken');
const { getTop } = require('../utils/lastfm/getTop');
const { getAdditionalSongInfo } = require('../utils/getAdditionalSongInfo');

module.exports = {
    id: 'TOP',
    async execute(interaction, type, page, action, userid) {
        await interaction.deferUpdate();

        if (interaction.user.id != userid) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **Only** <@${userid}> **can use this button.**`).isEphemeral().build());

        const session = await getSessionToken(interaction.user.id) || null;
        if (!session) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **This command requires a Last.fm account.**\n-# For more information, type </login:1429230213920985259>.`).isEphemeral().build());

        const userData = await getUserData(session);
        if (!userData) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const top = await getTop(userData?.user?.name, type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(), 100);
        if (!top) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const numTracks = top?.toptracks?.track?.length;

        page = Number(page);

        if (action == "FORWARD") page++;
        else if (action == "BACK") page--;
        else if (action == "LAST") page = numTracks;
        else if (action == "FIRST") page = 1;

        if (page - 1 >= numTracks || page <= 0) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **You have reached the final page in this direction.**`).isEphemeral().build());

        const track = top?.toptracks?.track?.[page - 1] || null;
        if (!track) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const asiData = await getAdditionalSongInfo(track?.mbid, track?.artist?.mbid) || null;

        const container = new ContainerBuilder()
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ${track?.url ? `[${track?.name}]` : track?.name}${track?.url ? `(${track?.url})` : ``}\n-# by **${track?.artist?.name || 'Unknown'}**.`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(`${track?.image?.at(-1)?.['#text'].replace('/300x300', '') || asiData?.images?.[0]?.image || 'https://lastfm.freetls.fastly.net/i/u/2a96cbd8b46e442fc41c2b86b821562f.png'}`)
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`:trophy: **Rank:** ${track?.['@attr']?.rank}/${numTracks}\n\`${Number(track?.playcount).toLocaleString()}\` total plays.`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('1')
                    .setCustomId(`TOP,TRACKS,${page},FIRST,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel('◀')
                    .setCustomId(`TOP,TRACKS,${page},BACK,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel('▶')
                    .setCustomId(`TOP,TRACKS,${page},FORWARD,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel(`${numTracks}`)
                    .setCustomId(`TOP,TRACKS,${page},LAST,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary)
            )

        try {
            await interaction.message.edit({
                flags: MessageFlags.IsComponentsV2,
                components: [container, row]
            })
        } catch (e) {
            return console.log(`[NOWPLAYING] Error on top button: ${String(e)}`)
        }
    }
}