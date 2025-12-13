const { Events, MessageFlags, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, SeparatorBuilder, MediaGalleryBuilder } = require('discord.js');
const ContainerMessage = require('../../utils/classes/ContainerMessage');
const { emojis } = require('../../config.json')
const { getSessionToken } = require('../../utils/lastfm/getSessionToken');
const { getUserData } = require('../../utils/lastfm/getUserData');
const { getRecentTracks } = require('../../utils/lastfm/getRecentTracks');

const aliases = ['.now', '.playing', '.song']

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        if (message.guild) {
            if (aliases.some(x => message.content.toLowerCase().startsWith(x))) {
                await message.channel.sendTyping();

                const session = await getSessionToken(message.author.id) || null;
                if (!session) return await message.reply(new ContainerMessage(`${emojis.ERROR} **This command requires a Last.fm account.**\n-# Type </login:1429230213920985259> to connect.`).isEphemeral().build());

                const userData = await getUserData(session);
                if (!userData) return await message.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

                const nowPlaying = await getRecentTracks(userData?.user?.name, 1);
                if (!nowPlaying) return await message.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

                const track = nowPlaying?.recenttracks?.track?.[0] || null;
                const stats = nowPlaying?.recenttracks?.['@attr'] || null;
                const isCurrentlyPlaying = track?.['@attr']?.nowplaying || null;

                if (!track || !stats) return await message.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

                const container = new ContainerBuilder()
                    .addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# ${track?.url ? `[${track?.name}]` : track?.name}${track?.url ? `(${track?.url})` : ``}\n-# by **${track?.artist['#text'] || 'Unknown'}**${track?.album['#text'] ? ` • *${track.album['#text']}*` : ''}`)
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder()
                                    .setURL(`${track?.image?.at(-1)?.['#text']?.replace('/300x300', '') || 'https://lastfm.freetls.fastly.net/i/u/2a96cbd8b46e442fc41c2b86b821562f.png'}`)
                            )
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`\`${Number(stats?.total).toLocaleString()}\` total scrobbles.${isCurrentlyPlaying ? '' : `\n-# Last scrobble: <t:${track?.date?.uts}:f>.`}`)
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
                    await message.reply({
                        flags: MessageFlags.IsComponentsV2,
                        components: [container]
                    })
                } catch (e) {
                    return console.log(`[NOWPLAYING] Error on np command: ${String(e)}`)
                }
            }
        }
    },
};