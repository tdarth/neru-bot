const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } = require('discord.js');
const { getAnilistToken } = require('../utils/getAnilistToken');
const ContainerMessage = require('../utils/classes/ContainerMessage');
const { getWrapped } = require('../utils/getWrapped');

const generalErrors = [
  'cannotgetid_error',
  'unknown_error',
  'graphql_error',
  'save_error'
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wrapped')
		.setDescription('Generate your AniWrapped!')
		.addStringOption((option) => option.setName('year').setDescription('The year to generate your wrapped').setRequired(false))
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
		.setContexts([InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel]),
	async execute(interaction) {
		const toYear = interaction?.options?.getString('year') || 2025;

		const token = await getAnilistToken(interaction.user.id);
        if (token == 'user_not_linked') return interaction.reply(new ContainerMessage('not linked').isEphemeral().build());

		const wrapped = await getWrapped(token, interaction.user.id, Number(toYear));
		if (wrapped == 'noanimefound_error') return interaction.reply(new ContainerMessage(`:x: **Please link your account.** </link:1450971543852158987>`).isEphemeral().build());
		if (wrapped == 'nodatainyear_error') return interaction.reply(new ContainerMessage(`:x: **No data was found in that year.**`).isEphemeral().build());
		if (generalErrors.includes(wrapped)) return interaction.reply(new ContainerMessage(`:x: **An error occurred.** Please report this!\n-# Error code: \`${wrapped}\`.`).isEphemeral().build());

        await interaction.reply(`## :tada: Your ${toYear} AniWrapped!\n${wrapped}`);
	},
};