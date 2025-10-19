const { SlashCommandSubcommandBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, SeparatorBuilder, MediaGalleryBuilder } = require('discord.js');
const ContainerMessage = require('../utils/classes/ContainerMessage');
const { emojis } = require('../config.json')
const { getSessionToken } = require('../utils/lastfm/getSessionToken');
const { getUserData } = require('../utils/lastfm/getUserData');
const { getRecentTracks } = require('../utils/lastfm/getRecentTracks');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('np')
        .setDescription('Shows your last or currently playing song'),
    async execute(interaction) {
        const session = await getSessionToken(interaction.user.id) || null;
        if (!session) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **This command requires a Last.fm account.**\n-# For more information, type </login:1429230213920985259>.`).isEphemeral().build());

        const userData = await getUserData(session);
        if (!userData) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const nowPlaying = await getRecentTracks(userData?.user?.name, 1);
        if (!nowPlaying) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const track = nowPlaying?.recenttracks?.track?.[0] || null;
        const stats = nowPlaying?.recenttracks?.['@attr'] || null;
        const isCurrentlyPlaying = track?.['@attr']?.nowplaying || null;

        if (!track || !stats) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const container = new ContainerBuilder()
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# [${track.name}](${track.url})\n-# by **${track.artist['#text']}** • *${track.album['#text']}*`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(`${track.image[track.image.length - 1]['#text'].replace('/300x300', '')}`)
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`\`${Number(stats.total).toLocaleString()}\` total scrobbles.${isCurrentlyPlaying ? '' : `\n-# Last scrobble: <t:${track.date.uts}:f>.`}`)
            );

        if (isCurrentlyPlaying) {
            container
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent("-# ▶  Currently playing now.")
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                )
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder({
                        items: [
                            {
                                media: {
                                    url: 'https://i.imgur.com/lRYQYEi.gif'
                                }
                            }
                        ]
                    })
                )
        }

        try {
            await interaction.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [container]
            })
        } catch (e) {
            return console.log(`[NOWPLAYING] Error on np command: ${String(e)}`)
        }
    }
};