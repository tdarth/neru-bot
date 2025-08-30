const { SlashCommandSubcommandBuilder, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const ContainerMessage = require('../../utils/ContainerMessage');
const { messages } = require('../../messages.json');
const { readData } = require('../../utils/dataHelper');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('role-all')
        .setDescription("Fetches all members, assigning or removing roles"),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(new ContainerMessage(messages.errors.MISSING_PERMISSION.replaceAll('{permission}', 'administrator')).isEphemeral().build());
        await interaction.deferReply();
        const rolesData = await readData(interaction.guild.id);
        const members = await interaction.guild.members.fetch({ limit: 50, force: true });
        const statusMessage = await interaction.editReply('Starting..');

        let processed = 0;
        let added = 0;
        let removed = 0;
        const logs = [];

        const roleToTags = new Map();
        for (const [dbTag, info] of Object.entries(rolesData)) {
            const { roleIds, serverId } = info;
            for (const roleId of roleIds) {
                if (!roleToTags.has(roleId)) roleToTags.set(roleId, []);
                roleToTags.get(roleId).push({ tag: dbTag, serverId });
            }
        }

        for (const [memberId, member] of members) {
            processed++;
            try {
                const primaryGuild = member.user.primaryGuild;
                if (!primaryGuild) continue;
                const tag = primaryGuild.tag;
                const identityGuildId = primaryGuild.identityGuildId;

                for (const [roleId, tagInfos] of roleToTags) {
                    const role = interaction.guild.roles.cache.get(roleId);
                    if (!role) continue;

                    const shouldHaveRole = tagInfos.some(info =>
                        info.tag === tag &&
                        info.serverId === identityGuildId
                    );

                    if (shouldHaveRole) {
                        if (!member.roles.cache.has(roleId)) {
                            await member.roles.add(role);
                            added++;
                            logs.push(`Added role to ${memberId}, tag: ${tag}, roleId: ${roleId}`);
                        }
                    } else {
                        if (member.roles.cache.has(roleId)) {
                            await member.roles.remove(role);
                            removed++;
                            logs.push(`Removed role from ${memberId}, tag: ${tag}, roleId: ${roleId}`);
                        }
                    }
                }
            } catch {
                logs.push(`Failed to process ${memberId}, tag: ${member.user.primaryGuild?.tag || 'unknown'}`);
            }

            if (processed % 10 === 0) {
                await statusMessage.edit(
                    `Processed ${processed}/${members.size} members...\nAdded: ${added}, Removed: ${removed}`
                );
            }
        }

        const logAttachment = new AttachmentBuilder(Buffer.from(logs.join('\n'), 'utf-8'), {
            name: 'role-sync-log.txt'
        });

        await statusMessage.edit({
            content: `${members.size} members.\nAdded roles: ${added}, Removed roles: ${removed}`,
            files: [logAttachment]
        });
    }
};