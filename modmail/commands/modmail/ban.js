const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');
const { staffRoles } = require('../../config.json');
const { messages } = require('../../messages.json');
const { addBannedUser, isUserBanned } = require('../../db/utils/helper');
const { formatUser } = require('../../utils/formatUser');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('ban')
        .setDescription("Ban a user from creating ModMail tickets")
        .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason to ban this user. This will be shown to the member, leave blank otherwise')),
    async execute(interaction) {
        if (!interaction.guild) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.NOT_IN_SERVER });
        if (!interaction.member.roles.cache.some(role => staffRoles.includes(role.id))) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.MISSING_PERMISSION });

        const user = interaction?.options?.getUser('user') || null;
        const reason = interaction?.options?.getString('reason') || null;

        if (!user) return await interaction.reply({flags: MessageFlags.Ephemeral, content: messages.errors.CATCH_ALL_ERROR_COMMAND});
        if (user.bot) return await interaction.reply({flags: MessageFlags.Ephemeral, content: messages.errors.NO_BOTS_ALLOWED});

        const userStatus = await isUserBanned(interaction.guild.id, user.id);
        if (userStatus?.banned) return await interaction.reply(messages.errors.USER_ALREADY_BANNED.replaceAll('{user}', `${formatUser(user)}`).replaceAll('{reason}', userStatus.reason ? `(\`${userStatus.reason}\`)` : ''));

        await addBannedUser(interaction.guild.id, user.id, reason || 'No reason specified.');
        await interaction.reply({content: messages.success.USER_BANNED.replaceAll('{user}', formatUser(user)).replaceAll('{reason}', reason ? `(\`${reason}\`)` : ''), allowedMentions: { repliedUser: true, parse: [] }});
    }
};