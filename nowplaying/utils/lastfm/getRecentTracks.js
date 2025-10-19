const { URLSearchParams } = require("url");

async function getRecentTracks(user, limit) {
    const params = {
        method: 'user.getRecentTracks',
        user,
        api_key: process.env.LAST_FM_API_KEY,
        format: 'json',
        limit
    };

    const response = await fetch(`${process.env.LAST_FM_API_URL}?${new URLSearchParams(params).toString()}`);

    if (!response.ok) return false;

    return await response.json();
}

module.exports = { getRecentTracks };