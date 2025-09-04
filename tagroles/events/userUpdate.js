const { Events } = require('discord.js');
const { readData } = require('../utils/dataHelper');

const userTagHistory = new Map();
const PATTERN_LENGTH = 15;
const TIME_TOLERANCE = 500;

module.exports = {
    name: Events.UserUpdate,
    async execute(oldUser, newUser) {
        try {
            const primaryGuild = newUser.primaryGuild;
            if (!primaryGuild) return;

            const tag = primaryGuild.tag;
            const identityGuildId = primaryGuild.identityGuildId;

            if (!userTagHistory.has(newUser.id)) {
                userTagHistory.set(newUser.id, []);
            }

            const history = userTagHistory.get(newUser.id);
            const now = Date.now();
            history.push({ tag, time: now });
            if (history.length > PATTERN_LENGTH) history.shift();

            let skipRoleUpdate = false;

            if (history.length === PATTERN_LENGTH) {
                const intervals = [];
                for (let i = 1; i < history.length; i++) {
                    intervals.push(history[i].time - history[i - 1].time);
                }

                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                skipRoleUpdate = intervals.every(interval => Math.abs(interval - avgInterval) <= TIME_TOLERANCE);
            }

            if (skipRoleUpdate) return;

            for (const [guildId, guild] of newUser.client.guilds.cache) {
                const member = await guild.members.fetch(newUser.id).catch(() => null);
                if (!member) continue;

                const rolesData = await readData(guild.id);

                const roleToTags = new Map();
                for (const [dbTag, servers] of Object.entries(rolesData)) {
                    for (const [serverId, info] of Object.entries(servers)) {
                        const { roleIds } = info;
                        for (const roleId of roleIds) {
                            if (!roleToTags.has(roleId)) roleToTags.set(roleId, []);
                            roleToTags.get(roleId).push({ tag: dbTag, serverId });
                        }
                    }
                }

                for (const [roleId, tagInfos] of roleToTags) {
                    const role = guild.roles.cache.get(roleId);
                    if (!role) continue;

                    const shouldHaveRole = tagInfos.some(info =>
                        info.tag === tag &&
                        info.serverId === identityGuildId
                    );

                    const hasRole = member.roles.cache.has(roleId);

                    if (shouldHaveRole && !hasRole) {
                        await member.roles.add(role).catch(() => {});
                    } else if (!shouldHaveRole && hasRole) {
                        await member.roles.remove(role).catch(() => {});
                    }
                }
            }
        } catch (err) {
            console.error(`[UserUpdate] Failed to process ${newUser.id}:`, err);
        }
    }
};