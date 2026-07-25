const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');
const { staffRoles } = require('../../config.json');
const { messages } = require('../../messages.json');

const autocompleteList = Object.keys(messages.templates).map(key => {
    const label = key
        .toLowerCase()
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return { name: label, value: key };
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('templates')
        .setDescription("View templates to respond back with")
        .addStringOption(option => option.setName('template').setDescription('Choose the template to view').setRequired(true).setAutocomplete(true)),
    async execute(interaction) {
        if (!interaction.guild) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.NOT_IN_SERVER });
        if (!interaction.member.roles.cache.some(role => staffRoles.includes(role.id))) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.MISSING_PERMISSION });

        const templateName = interaction?.options?.getString('template') || null;
        if (!templateName) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.CATCH_ALL_ERROR_COMMAND });
        if (!autocompleteList.some(choice => choice.value == templateName)) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.TEMPLATE_NOT_FOUND });

        const templateContent = messages.templates[templateName];
        await interaction.reply(`:bulb: Template for: \`${templateName}\`\n\n\`\`\`${templateContent}\`\`\``);
    },

    async autocomplete(interaction) {
        if (!interaction.guild) return await interaction.respond([{ name: "You cannot use this command here.", value: "not_in_guild" }]);
        if (!interaction.member.roles.cache.some(role => staffRoles.includes(role.id))) return await interaction.respond([{ name: "Missing permissions.", value: "no_permission" }]);

        const focusedValue = interaction.options.getFocused();
        const filtered = autocompleteList.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.toLowerCase()));

        await interaction.respond(filtered.slice(0, 25));
    }
};