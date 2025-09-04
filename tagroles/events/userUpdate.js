const { Events } = require('discord.js');
const { readData } = require('../utils/dataHelper');

const tagSpammers = new Map();
const WINDOW = 30000;
const MIN_FLIPS = 30;
const INTERVAL_TOLERANCE = 1000;

module.exports = {
    name: Events.UserUpdate,
    async execute(oldUser, newUser) {
        try {
            if (!newUser.primaryGuild) return;

            const oldTag = oldUser.primaryGuild?.tag;
            const newTag = newUser.primaryGuild.tag;
            if (oldTag === newTag) return;

            const userId = newUser.id;
            const now = Date.now();

            let data = tagSpammers.get(userId);
            if (!data) {
                data = { timestamps: [], ignoring: false };
                tagSpammers.set(userId, data);
            }

            data.timestamps.push(now);
            data.timestamps = data.timestamps.filter(ts => now - ts <= WINDOW);

            if (data.timestamps.length >= MIN_FLIPS) {
                const intervals = [];
                for (let i = 1; i < data.timestamps.length; i++) {
                    intervals.push(data.timestamps[i] - data.timestamps[i - 1]);
                }

                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                const consistent = intervals.every(interval =>
                    Math.abs(interval - avgInterval) <= INTERVAL_TOLERANCE
                );

                if (consistent && avgInterval <= 1500) {
                    data.ignoring = true;
                    console.log(`[UserUpdate] Ignoring ${userId}.`);
                } else {
                    data.ignoring = false;
                }
            }

            if (data.ignoring) return;

            const primaryGuild = newUser.primaryGuild;
            const tag = primaryGuild.tag;
            const identityGuildId = primaryGuild.identityGuildId;

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

            if (data.timestamps.length === 0 && !data.ignoring) {
                tagSpammers.delete(userId);
            }

        } catch (err) {
            console.error(`[UserUpdate] Failed to process ${newUser.id}:`, err);
        }
    }
};
