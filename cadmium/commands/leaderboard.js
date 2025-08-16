const { SlashCommandSubcommandBuilder, MessageFlags, ContainerBuilder, MediaGalleryBuilder, TextDisplayBuilder } = require('discord.js');
const { formatNumber } = require('../utils/formatNumber');
const { getLeaderboard } = require('../utils/leveling/getLeaderboard');
const { generateLevelCard } = require('../utils/leveling/generateLevelCard');
const { getDiscUserById } = require('../utils/getDiscUserById');
const { getLevel } = require('../utils/leveling/getLevel');
const { getUserData } = require('../utils/user/getUserData');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('leaderboard')
        .setDescription("View the leaderboard of the server")
        .addStringOption(option => option.setName('limit').setDescription('The amount of members to show, default 25').setRequired(false)),
    async execute(interaction) {
        const limit = formatNumber(Math.max(parseInt(interaction.options.getString('limit'), 10), 0), 100) || 25;

        const leaderboard = await getLeaderboard(interaction.guild.id, limit);
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
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ${interaction.guild.name} Level Leaderboard`)
            )
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

        let leaderboardContents = [];

        for (const user of leaderboard.slice(1)) {
            leaderboardContents.push(`\`#${user.rank}\` <@${user.id}> - **${user.level}** (${user.xp}/${user.xpNeeded})`);
        }

        leaderboardContents.push(`-# Showing the Top ${limit} members.`);

        if (leaderboardContents.length > 0) response.addTextDisplayComponents(new TextDisplayBuilder().setContent(leaderboardContents.join('\n')));

        await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [response],
            allowedMentions: { parse: [] }
        });
    }
};