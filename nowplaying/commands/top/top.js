const { SlashCommandSubcommandBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, SeparatorBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ContainerMessage = require('../../utils/classes/ContainerMessage');
const { emojis } = require('../../config.json')
const { getSessionToken } = require('../../utils/lastfm/getSessionToken');
const { getUserData } = require('../../utils/lastfm/getUserData');
const { getTop } = require('../../utils/lastfm/getTop');
const { getAdditionalSongInfo } = require('../../utils/getAdditionalSongInfo');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('tracks')
        .setDescription('Shows your top overall tracks'),
    async execute(interaction) {
        const session = await getSessionToken(interaction.user.id) || null;
        if (!session) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **This command requires a Last.fm account.**\n-# For more information, type </login:1429230213920985259>.`).isEphemeral().build());

        const userData = await getUserData(session);
        if (!userData) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const top = await getTop(userData?.user?.name, "Tracks", 100);
        if (!top) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const track = top?.toptracks?.track?.[0] || null;

        if (!track) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const asiData = await getAdditionalSongInfo(track?.mbid, track?.artist?.mbid) || null;

        const numTracks = top?.toptracks?.track?.length;

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
                    .setCustomId(`TOP,TRACKS,1,FIRST,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel('◀')
                    .setCustomId(`TOP,TRACKS,1,BACK,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel('▶')
                    .setCustomId(`TOP,TRACKS,1,FORWARD,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel(`${numTracks}`)
                    .setCustomId(`TOP,TRACKS,1,LAST,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary)
            )

        try {
            await interaction.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [container, row]
            })
        } catch (e) {
            return console.log(`[NOWPLAYING] Error on top command: ${String(e)}`)
        }
    }
};