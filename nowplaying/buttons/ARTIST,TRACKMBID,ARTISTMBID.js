const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js')
const ContainerMessage = require('../utils/classes/ContainerMessage');
const { emojis } = require('../config.json');
const { getAdditionalSongInfo } = require('../utils/getAdditionalSongInfo');

module.exports = {
    id: 'ARTIST',
    async execute(interaction, track_mbid, artist_mbid) {
        await interaction.deferUpdate();

        if (track_mbid == 'null' || !track_mbid) track_mbid = null;
        if (artist_mbid == 'null' || !artist_mbid) artist_mbid = null;

        if (!track_mbid && !artist_mbid) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **No data found for this artist.**`).isEphemeral().build());

        const asiData = await getAdditionalSongInfo(track_mbid, artist_mbid) || null;

        if (!asiData?.artist) return await interaction.followUp(new ContainerMessage(`${emojis.ERROR} **No data found for this artist.**`).isEphemeral().build());

        const container = new ContainerBuilder();

        if (asiData?.artist?.name) container
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ${asiData?.artist?.name}`)
            )

        if (asiData?.artist?.['life-span']?.begin || asiData?.artist?.['life-span']?.end) {
            const born = asiData?.artist?.['life-span']?.begin || null;
            const died = asiData?.artist?.['life-span']?.end || null;

            container
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`${born && died ? `Born **${born}**, Died **${died}**` : born ? `Born **${born}**` : died ? `Died **${died}**` : null}`)
                )
        }

        await interaction.followUp({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        })
    }
}