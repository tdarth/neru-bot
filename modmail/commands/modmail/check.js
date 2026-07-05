const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');
const { staffRoles, modmailChannelType, modmailChannelForThreadId } = require('../../config.json');
const { messages } = require('../../messages.json');
const { getUserByChannel } = require('../../utils/store');
const { getDiscUserById } = require('../../utils/getDiscUserById');
const { formatUser } = require('../../utils/formatUser');

function getEmoji(string) {
    return `${string ? ':white_check_mark:' : ':x:'}`;
}

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('check')
        .setDescription("Returns information about the user who opened this ticket"),
    async execute(interaction) {
        if (!interaction.guild) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.NOT_IN_SERVER });
        if (!interaction.member.roles.cache.some(role => staffRoles.includes(role.id))) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.MISSING_PERMISSION });
        if (!interaction.channel.name.includes('modmail-') || (modmailChannelType == 1 && interaction.channel.parentId !== modmailChannelForThreadId)) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.NOT_MODMAIL });

        const user = await getDiscUserById(interaction.client, interaction.channel.topic || getUserByChannel(process.env.GUILD_ID, interaction.channel.id) || null);
        const member = await getDiscUserById(interaction.client, interaction.channel.topic || getUserByChannel(process.env.GUILD_ID, interaction.channel.id) || null, true, process.env.GUILD_ID);

        if (!user) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.NOT_MODMAIL });

        const isInServer = member;
        const accountCreation = Math.floor(user?.createdTimestamp / 1000) || null;
        const memberLength = isInServer ? Math.floor(member.joinedTimestamp / 1000) : null;

        return await interaction.reply({content: `:information_source: ${formatUser(user)}\n\n${getEmoji(isInServer)} **User currently ${isInServer ? '' : '__NOT__ '}in the server.**\n${memberLength ? `-# - :arrow_forward: Joined: <t:${memberLength}:f> (<t:${memberLength}:R>)\n` : ''}:hourglass: Account Creation: <t:${accountCreation}:f> (<t:${accountCreation}:R>)`, allowedMentions: { parse: [] }})
    }
};