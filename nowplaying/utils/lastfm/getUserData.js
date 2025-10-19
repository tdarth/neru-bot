const { makeApiSig } = require('../makeApiSig');

async function getUserData(session) {
    const params = {
        method: 'user.getInfo',
        api_key: process.env.LAST_FM_API_KEY,
        sk: session
    };

    const apiSig = makeApiSig(params);
    const form = new URLSearchParams({ ...params, apiSig, format: 'json' });

    const response = await fetch(process.env.LAST_FM_API_URL, {
        method: 'POST',
        body: form,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!response.ok) return false;

    return await response.json();
}

module.exports = { getUserData };