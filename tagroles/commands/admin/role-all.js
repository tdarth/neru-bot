const { SlashCommandSubcommandBuilder, AttachmentBuilder } = require('discord.js');
const ContainerMessage = require('../../utils/ContainerMessage');
const { messages } = require('../../messages.json');
const { readData } = require('../../utils/dataHelper');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('role-all')
        .setDescription("Fetches all members, assigning or removing roles"),
    async execute(interaction) {
        await interaction.deferReply();

        const rolesData = await readData(interaction.guild.id);
        const members = await interaction.guild.members.fetch();
        const statusMessage = await interaction.editReply(new ContainerMessage('starting..').build());

        let processed = 0;
        let added = 0;
        let removed = 0;

        const logs = [];

        for (const [memberId, member] of members) {
            processed++;
            try {
                const primaryGuild = member.user.primaryGuild;
                if (!primaryGuild) continue;

                const tag = primaryGuild.tag;
                const identityGuildId = primaryGuild.identityGuildId;

                for (const [dbTag, info] of Object.entries(rolesData)) {
                    const { roleIds, serverId } = info;
                    if (identityGuildId !== serverId) continue;

                    const hasTag = tag === dbTag;

                    for (const roleId of roleIds) {
                        const role = interaction.guild.roles.cache.get(roleId);
                        if (!role) continue;

                        if (hasTag) {
                            if (!member.roles.cache.has(roleId)) {
                                await member.roles.add(role);
                                added++;
                                logs.push(`Added role to ${memberId}, tag: ${dbTag}, roleId: ${roleId}`);
                            }
                        } else {
                            if (member.roles.cache.has(roleId)) {
                                await member.roles.remove(role);
                                removed++;
                                logs.push(`Removed role from ${memberId}, tag: ${dbTag}, roleId: ${roleId}`);
                            }
                        }
                    }
                }
            } catch {
                logs.push(`Failed to process ${memberId}, tag: ${member.user.primaryGuild?.tag || 'unknown'}`);
            }

            if (processed % 10 === 0) {
                await statusMessage.edit(
                    new ContainerMessage(`Processed ${processed}/${members.size} members...\nAdded: ${added}, Removed: ${removed}`).build()
                );
            }
        }

        const logAttachment = new AttachmentBuilder(Buffer.from(logs.join('\n'), 'utf-8'), {
            name: `role-sync-log.txt`
        });

        await statusMessage.edit({
            content: `Finished processing ${members.size} members.\nAdded roles: ${added}, Removed roles: ${removed}`,
            files: [logAttachment]
        });
    }
};