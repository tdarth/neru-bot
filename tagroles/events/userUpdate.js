const { Events } = require('discord.js');
const { readData } = require('../../utils/dataHelper');

module.exports = {
    name: Events.UserUpdate,
    async execute(oldUser, newUser) {
        try {
            if (oldUser.primaryGuild.tag === newUser.primaryGuild.tag) return;

            for (const [guildId, guild] of newUser.client.guilds.cache) {
                const member = await guild.members.fetch(newUser.id).catch(() => null);
                if (!member) continue;

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

                    const shouldHaveRole = allowedTags.has(newUser.tag);

                    if (shouldHaveRole) {
                        if (!member.roles.cache.has(roleId)) {
                            await member.roles.add(role).catch(() => {});
                        }
                    } else {
                        if (member.roles.cache.has(roleId)) {
                            await member.roles.remove(roleId).catch(() => {});
                        }
                    }
                }
            }
        } catch (err) {
            console.error(`Failed to process userUpdate for ${newUser.id}:`, err);
        }
    }
};