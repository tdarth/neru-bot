const { SlashCommandSubcommandBuilder } = require('discord.js');
const ContainerMessage = require('../../utils/ContainerMessage');
const { messages } = require('../../messages.json');
const { readData } = require('../../utils/dataHelper');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('list')
        .setDescription("Lists the roles that are given out"),
    async execute(interaction) {
        const rolesData = await readData(interaction.guild.id);
        let reply = "";

        for (const [tag, servers] of Object.entries(rolesData)) {
            for (const [serverId, info] of Object.entries(servers)) {
                const mentions = info.roleIds.map(id => `<@&${id}>`).join(', ');
                reply += `\`${tag}\` (ID: ${serverId}): ${mentions}\n`;
            }
        }

        if (!reply) reply = messages.info.NO_ROLES_SETUP;

        await interaction.reply(new ContainerMessage(reply).build());
    }
};
