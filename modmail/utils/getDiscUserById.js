async function getDiscUserById(client, userId, asMember = false, serverId = null) {
    try {
        if (asMember) {
            if (!serverId) throw new Error("[MODMAIL] serverId is required when asMember = true");

            const guild = client.guilds.cache.get(serverId) || await client.guilds.fetch(serverId);
            if (!guild) return false;

            const member = guild.members.cache.get(userId) || await guild.members.fetch(userId).catch(() => null);
            return member || false;
        } else {
            let user = client.users.cache.get(userId);
            if (user) return user;

            user = await client.users.fetch(userId).catch(() => null);
            return user || false;
        }
    } catch (err) {
        return false;
    }
}

module.exports = { getDiscUserById };