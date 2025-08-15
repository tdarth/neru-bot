const { SlashCommandSubcommandBuilder, ContainerBuilder, MessageFlags, SectionBuilder, TextDisplayBuilder, MediaGalleryBuilder } = require('discord.js');
const { getLevel } = require('../utils/leveling/getLevel');
const { generateLevelCard } = require('../utils/leveling/generateCard');
const { getServerConfig } = require('../utils/server/getServerConfig');
const { messages } = require('../messages.json');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('level')
		.setDescription("View you or a user's level")
		.addUserOption(option => option.setName('member').setDescription('The member to view').setRequired(false)),
	async execute(interaction) {
		const targetUser = interaction?.options?.getUser('member') || interaction.user;

		if (targetUser.bot) return await interaction.reply(new ContainerMessage(messages.errors.CANNOT_LEVELCHECK_BOT).isEphemeral().build());

		const level = await getLevel(interaction.guild.id, targetUser.id);
		if ((level.xp == 0 || level.xp == null) && level.level == 0) return await interaction.reply(new ContainerMessage(messages.info.USER_HAS_NO_XP.replace('{user}', `<@${targetUser.id}>`)).build());

		// await interaction.reply(new ContainerMessage(messages.info.USER_HAS_XP
		// 	.replaceAll('{user}', `<@${targetUser.id}>`)
		// 	.replaceAll('{level}', level.level.toLocaleString())
		// 	.replaceAll('{xp}', level.xp.toLocaleString())
		// 	.replaceAll('{nextLevelXp}', level.nextLevelXp.toLocaleString())
		// 	.replaceAll('{totalXp}', level.totalXp.toLocaleString())
		// ).build());

		const serverConfig = getServerConfig(interaction.guild.id);

		const levelCard = await generateLevelCard({
			userName: targetUser.username || 'User',
			avatar: `https://cdn.discordapp.com/avatars/${targetUser.id}/${targetUser.avatar}.png`,
			level: level.level,
			currentXp: level.xp,
			nextLevelXp: level.nextLevelXp,
			bg_color: "#202024",
			rank: 'Coming Soon'
		});

		await interaction.reply({
			flags: MessageFlags.IsComponentsV2,
			components: [
				new ContainerBuilder()

					.addTextDisplayComponents(
						new TextDisplayBuilder()
							.setContent(serverConfig.level_command_message.toString()
								.replaceAll('{user}', `<@${targetUser.id}>`)
								.replaceAll('{level}', level.level.toLocaleString())
								.replaceAll('{xp}', level.xp.toLocaleString())
								.replaceAll('{nextLevelXp}', level.nextLevelXp.toLocaleString())
								.replaceAll('{totalXp}', level.totalXp.toLocaleString()))
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
			]
		})
	}
};