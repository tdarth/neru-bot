const { Events } = require('discord.js');
const { readData } = require('../utils/dataHelper');

module.exports = {
    name: Events.UserUpdate,
    async execute(oldUser, newUser) {
        try {
            if (!oldUser?.primaryGuild || !newUser?.primaryGuild) return;
            if (oldUser.primaryGuild.tag === newUser.primaryGuild.tag) return;

            console.log(`[UserUpdate] Tag changed for ${newUser.id}: ${oldUser.primaryGuild.tag} → ${newUser.primaryGuild.tag}`);

            for (const [guildId, guild] of newUser.client.guilds.cache) {
                const member = await guild.members.fetch(newUser.id, { force: true }).catch(() => null);
                if (!member) continue;

                const primaryGuild = member.user.primaryGuild;
                if (!primaryGuild) continue;

                const tag = primaryGuild.tag;
                const identityGuildId = primaryGuild.identityGuildId;

                const rolesData = await readData(guild.id);

                const roleToTags = new Map();
                for (const [dbTag, info] of Object.entries(rolesData)) {
                    for (const roleId of info.roleIds) {
                        if (!roleToTags.has(roleId)) roleToTags.set(roleId, new Set());
                        roleToTags.get(roleId).add(dbTag);
                    }
                }

                for (const [roleId, allowedTags] of roleToTags) {
                    const role = guild.roles.cache.get(roleId);
                    if (!role) continue;

                    const hasRole = member.roles.cache.has(roleId);
                    const shouldHaveRole = allowedTags.has(tag);

                    if (shouldHaveRole && !hasRole) {
                        await member.roles.add(role).catch(() => {});
                        console.log(`[UserUpdate] Added role ${role.name} (${roleId}) to ${newUser.id} for tag ${tag}`);
                    } else if (!shouldHaveRole && hasRole) {
                        await member.roles.remove(role).catch(() => {});
                        console.log(`[UserUpdate] Removed role ${role.name} (${roleId}) from ${newUser.id} for tag ${tag}`);
                    }
                }
            }
        } catch (err) {
            console.error(`[UserUpdate] Failed to process ${newUser.id}:`, err);
        }
    }
};