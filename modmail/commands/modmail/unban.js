const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');
const { staffRoles } = require('../../config.json');
const { messages } = require('../../messages.json');
const { removeBannedUser, isUserBanned } = require('../../db/utils/helper');
const { formatUser } = require('../../utils/formatUser');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('unban')
        .setDescription("Unban a user from ModMail")
        .addUserOption(option => option.setName('user').setDescription('The user to unban from ModMail').setRequired(true)),
    async execute(interaction) {
        if (!interaction.guild) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.NOT_IN_SERVER });
        if (!interaction.member.roles.cache.some(role => staffRoles.includes(role.id))) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.MISSING_PERMISSION });

        const user = interaction?.options?.getUser('user') || null;

        if (!user) return await interaction.reply({flags: MessageFlags.Ephemeral, content: messages.errors.CATCH_ALL_ERROR_COMMAND});
        if (user.bot) return await interaction.reply({flags: MessageFlags.Ephemeral, content: messages.errors.NO_BOTS_ALLOWED});
        
        const userStatus = await isUserBanned(interaction.guild.id, user.id);
        if (!userStatus?.banned) return await interaction.reply(messages.errors.USER_ALREADY_UNBANNED.replaceAll('{user}', `${formatUser(user)}`));

        await removeBannedUser(interaction.guild.id, user.id);
        await interaction.reply({content: messages.success.USER_UNBANNED.replaceAll('{user}', formatUser(user)), allowedMentions: { repliedUser: true, parse: [] }});
    }
};