const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, MessageFlags, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ButtonBuilder, ButtonStyle, SeparatorBuilder } = require('discord.js');
const ContainerMessage = require('../utils/classes/ContainerMessage');
const { getAnilistToken, getId } = require('../utils/getAnilistToken');
const crypto = require('crypto');

const KV_API_BASE = process.env.KV_API_URL;
const API_SECRET = process.env.KV_API_SECRET;
const LOGIN_PAGE = process.env.LOGIN_URL;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Link your AniList.co account to AniWrapped')
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
		.setContexts([InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel]),
	async execute(interaction) {
		const token = await getAnilistToken(interaction.user.id);
		if (typeof token === 'string' && !['user_not_linked', 'user_token_expire'].includes(token) && !token.startsWith('Error:')) return await interaction.reply(new ContainerMessage(`:white_check_mark: **Account Linked!** </wrapped:1450971543852158988> is now available.\n-# > https://anilist.co/user/${await getId(interaction.user.id)}`).isEphemeral().build());

		const state = crypto.randomBytes(16).toString('hex');

		const storeURL = new URL(KV_API_BASE);
		storeURL.searchParams.set('key', `state:${state}`);
		storeURL.searchParams.set('ttl', 300); // 5 min expire time

		await fetch(storeURL.toString(), {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${API_SECRET}`,
				'Content-Type': 'text/plain',
			},
			body: interaction.user.id,
		});

		const loginURL = `${LOGIN_PAGE}?state=${state}`;

		await interaction.reply({
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			components: [
				new ContainerBuilder()
					.addSectionComponents(
						new SectionBuilder()
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(
									'To link your **AniList** account to *AniWrapped*, please click the button.'
								)
							)
							.setButtonAccessory(
								new ButtonBuilder()
									.setLabel('Link Account')
									.setStyle(ButtonStyle.Link)
									.setURL(loginURL)
							)
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
					)
					.addSectionComponents(
						new SectionBuilder()
							.addTextDisplayComponents(
								new TextDisplayBuilder()
									.setContent(`*This will expire <t:${(Math.floor(Date.now() / 1000) + 300)}:R>.*`)
							)
							.setButtonAccessory(
								new ButtonBuilder()
									.setCustomId(`check_link:${interaction.user.id}`)
									.setLabel('Finished?')
									.setStyle(ButtonStyle.Primary)
							)
					)
			],
		});
	},
};