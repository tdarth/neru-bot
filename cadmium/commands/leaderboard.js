const { SlashCommandSubcommandBuilder, MessageFlags, ContainerBuilder, MediaGalleryBuilder, TextDisplayBuilder } = require('discord.js');
const { formatNumber } = require('../utils/formatNumber');
const { getLeaderboard } = require('../utils/leveling/getLeaderboard');
const { generateLevelCard } = require('../utils/leveling/generateLevelCard');
const { getDiscUserById } = require('../utils/getDiscUserById');
const { messages } = require('../messages.json');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('leaderboard')
        .setDescription("View the leaderboard of the server")
        .addStringOption(option => option.setName('limit').setDescription('The amount of members to show, default 25').setRequired(false)),
    async execute(interaction) {
        const limit = formatNumber(Math.max(parseInt(interaction.options.getString('limit'), 10), 0), 100);
        if (isNaN(limit)) return interaction.reply(new ContainerMessage(messages.errors.MUST_BE_NUMBER.replaceAll('{argument}', 'limit')).isEphemeral().build());

        const leaderboard = await getLeaderboard();
        const topMember = await getDiscUserById(leaderboard[0].id);
        const topMemberLevel = await getLevel(interaction.guild.id, topMember.id);
        const topMemberUserData = await getUserData(interaction.guild.id, topMember.id);

        const levelCard = await generateLevelCard({
            userName: topMember.username || 'User',
            avatar: `https://cdn.discordapp.com/avatars/${topMember.id}/${topMember.avatar}.png`,
            level: topMemberLevel?.level,
            currentXp: topMemberLevel?.xp,
            nextLevelXp: topMemberLevel?.nextLevelXp,
            bg_color: "#202024",
            filledBarColor: topMemberUserData?.card_bar_color,
            background: topMemberUserData?.card_bg_image,
            rank: leaderboard[0].rank
        });

        let response = new ContainerBuilder();

        response
            .addMediaGalleryComponents(
                new MediaGalleryBuilder({
                    items: [
                        {
                            media: {
                                url: levelCard,
                            },
                        },
                    ],
                })
            )

        for (const user of leaderboard) {
            response
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`<@${user.id}> - Level: **${user.level}** (${user.xp}/${user.xpNeeded})\n`)
                )
        }

        await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [response],
            allowedMentions: { parse: [] }
        });
    }
};