const { SlashCommandSubcommandBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder, SectionBuilder, SeparatorBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ContainerMessage = require('../../utils/classes/ContainerMessage');
const { emojis } = require('../../config.json')
const { getSessionToken } = require('../../utils/lastfm/getSessionToken');
const { getUserData } = require('../../utils/lastfm/getUserData');
const { getTop } = require('../../utils/lastfm/getTop');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('artists')
        .setDescription('Shows your top overall artists'),
    async execute(interaction) {
        const session = await getSessionToken(interaction.user.id) || null;
        if (!session) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **This command requires a Last.fm account.**\n-# Type </login:1429230213920985259> to connect.`).isEphemeral().build());

        const userData = await getUserData(session);
        if (!userData) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const top = await getTop(userData?.user?.name, "Artists", 250);
        if (!top) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const artist = top?.topartists?.artist?.[0] || null;

        if (!artist) return await interaction.reply(new ContainerMessage(`${emojis.ERROR} **An error occurred while fetching this data.**`).isEphemeral().build());

        const numArtists = top?.topartists?.artist?.length;

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
                    .setCustomId(`TOP_ARTISTS,1,FIRST,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel('◀')
                    .setCustomId(`TOP_ARTISTS,1,BACK,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel('▶')
                    .setCustomId(`TOP_ARTISTS,1,FORWARD,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel(`${numArtists}`)
                    .setCustomId(`TOP_ARTISTS,1,LAST,${interaction.user.id}`)
                    .setStyle(ButtonStyle.Secondary)
            )

        try {
            await interaction.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [container, row]
            })
        } catch (e) {
            return console.log(`[NOWPLAYING] Error on top artists command: ${String(e)}`)
        }
    }
};