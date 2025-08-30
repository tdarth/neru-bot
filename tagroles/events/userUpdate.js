const { Events } = require('discord.js');
const { readData } = require('../utils/dataHelper');

module.exports = {
    name: Events.UserUpdate,
    async execute(oldUser, newUser) {
        try {
            if (!oldUser?.primaryGuild || !newUser?.primaryGuild) return;
            if (oldUser.primaryGuild.tag === newUser.primaryGuild.tag &&
                oldUser.primaryGuild.identityGuildId === newUser.primaryGuild.identityGuildId) return;

            const oldTag = oldUser.primaryGuild.tag;
            const newTag = newUser.primaryGuild.tag;
            const identityGuildId = newUser.primaryGuild.identityGuildId;

            console.log(`[UserUpdate] Tag changed for ${newUser.id}: ${oldTag} → ${newTag}`);

            for (const [guildId, guild] of newUser.client.guilds.cache) {
                const member = await guild.members.fetch(newUser.id).catch(() => null);
                if (!member) continue;

                const rolesData = await readData(guild.id);

                const roleToTags = new Map();
                for (const [dbTag, info] of Object.entries(rolesData)) {
                    const { roleIds, serverId } = info;
                    for (const roleId of roleIds) {
                        if (!roleToTags.has(roleId)) roleToTags.set(roleId, []);
                        roleToTags.get(roleId).push({ tag: dbTag, serverId });
                    }
                }

                for (const [roleId, tagInfos] of roleToTags) {
                    const role = guild.roles.cache.get(roleId);
                    if (!role) continue;

                    const shouldHaveRole = tagInfos.some(info =>
                        info.tag === newTag &&
                        info.serverId === identityGuildId
                    );

                    const hadRoleBefore = tagInfos.some(info =>
                        info.tag === oldTag &&
                        info.serverId === identityGuildId
                    );

                    const hasRole = member.roles.cache.has(roleId);

                    if (shouldHaveRole && !hasRole) {
                        await member.roles.add(role).catch(() => {});
                        console.log(`[UserUpdate] Added role ${role.name} (${roleId}) to ${newUser.id}`);
                    } else if (!shouldHaveRole && hasRole && hadRoleBefore) {
                        await member.roles.remove(role).catch(() => {});
                        console.log(`[UserUpdate] Removed role ${role.name} (${roleId}) from ${newUser.id}`);
                    }
                }
            }
        } catch (err) {
            console.error(`[UserUpdate] Failed to process ${newUser.id}:`, err);
        }
    }
};