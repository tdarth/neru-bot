const { URLSearchParams } = require("url");

const cache = {};
const cache_timer = 1000 * 60 * 5; // 5 minutes

async function getTop(user, type, limit = 50) {
    type = `user.getTop${type}`;

    if (!cache[user]) cache[user] = {};
    const cached = cache[user][type];

    if (cached && Date.now() - cached.timestamp < cache_timer) {
        return cached.data;
    }

    const params = {
        method: type,
        user,
        limit,
        api_key: process.env.LAST_FM_API_KEY,
        format: 'json',
    };

    const response = await fetch(`${process.env.LAST_FM_API_URL}?${new URLSearchParams(params).toString()}`);

    if (!response.ok) return false;

    const data = await response.json();

    cache[user][type] = {
        data,
        timestamp: Date.now()
    };

    return data;
}

module.exports = { getTop };