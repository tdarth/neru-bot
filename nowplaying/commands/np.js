const { SlashCommandSubcommandBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, SeparatorBuilder, MediaGalleryBuilder } = require('discord.js');
const ContainerMessage = require('../utils/classes/ContainerMessage');
const { emojis } = require('../config.json')
const { getSessionToken } = require('../utils/lastfm/getSessionToken');
const { getUserData } = require('../utils/lastfm/getUserData');
const { getRecentTracks } = require('../utils/lastfm/getRecentTracks');
const { getSongInfo } = require('../utils/lastfm/getSongInfo');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('np')
        .setDescription('Shows your last or currently playing song')
        .addUserOption((option) => option.setName('user').setDescription('The user to view').setRequired(false)),
    async execute(interaction) {
        const target = interaction?.options?.getUser('user');
        let isOtherUser = false;

        if (target?.bot) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **You cannot use this command on bots.**`).isEphemeral().build());
        if (target) isOtherUser = true;

        const session = await getSessionToken(isOtherUser ? target?.id : interaction.user.id) || null;
        if (!session) return await interaction.reply(new ContainerMessage(isOtherUser ? `${emojis.ERROR} ${target} **has not linked their Last.fm account.**` : `${emojis.ERROR} **This command requires a Last.fm account.**\n-# Type </login:1429230213920985259> to connect.`).isEphemeral().build());

        const userData = await getUserData(session);
        if (!userData) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const nowPlaying = await getRecentTracks(userData?.user?.name, 1);
        if (!nowPlaying) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const track = nowPlaying?.recenttracks?.track?.[0] || null;
        const stats = nowPlaying?.recenttracks?.['@attr'] || null;
        const isCurrentlyPlaying = track?.['@attr']?.nowplaying || null;

        if (!track || !stats) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        let trackImage = track?.image?.at(-1)?.['#text']?.replace('/300x300', '') || null;
        if (!trackImage) {
            const fetchedTrackImage = await getSongInfo(track?.artist['#text'], track?.name);
            trackImage = fetchedTrackImage || 'https://lastfm.freetls.fastly.net/i/u/2a96cbd8b46e442fc41c2b86b821562f.png';
        }

        const container = new ContainerBuilder()
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ${track?.url ? `[${track?.name}]` : track?.name}${track?.url ? `(${track?.url})` : ``}\n-# by **${track?.artist['#text'] || 'Unknown'}**${track?.album['#text'] ? ` • *${track.album['#text']}*` : ''}`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(`${trackImage}`)
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`\`${Number(stats?.total).toLocaleString()}\` total scrobbles.${isCurrentlyPlaying ? '' : `\n-# Last scrobble: <t:${track?.date?.uts}:f>.${isOtherUser ? ` (for <@${target?.id}>)` : ''}`}`)
            );

        if (isCurrentlyPlaying) {
            container
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`-# ▶  Currently playing now.${isOtherUser ? ` (for <@${target?.id}>)` : ''}`)
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
                components: [container],
                allowedMentions: {
                    repliedUser: true,
                    parse: []
                }
            })
        } catch (e) {
            return console.log(`[NOWPLAYING] Error on np command: ${String(e)}`)
        }
    }
};