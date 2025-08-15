const { client } = require('../index');

async function getDiscUserById(userId) {
    let user = client.users.cache.get(userId);
    if (user) return user;

    try {
        user = await client.users.fetch(userId);
        return user || false;
    } catch (err) {
        return false;
    }
}

module.exports = { getDiscUserById };